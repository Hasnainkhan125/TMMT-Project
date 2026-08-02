"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

type Profile = {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: "applicant" | "officer" | "admin" | "pending_officer"
  created_at: string
  updated_at: string
}

type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

type AuthContextType = {
  user: User | null
  profile: Profile | null
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  signOut: () => Promise<void>
  markNotificationAsRead: (notificationId: string) => Promise<void>
  markAllNotificationsAsRead: () => Promise<void>
  refreshNotifications: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) {
        console.error("[v0] Profile fetch error:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("[v0] Profile fetch exception:", error)
      return null
    }
  }

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("[v0] Notifications fetch error:", error)
        return
      }

      if (data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error("[v0] Notifications fetch exception:", error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("id", notificationId)

      if (!error) {
        setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
      }
    } catch (error) {
      console.error("[v0] Mark notification as read error:", error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false)

      if (!error) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      }
    } catch (error) {
      console.error("[v0] Mark all notifications as read error:", error)
    }
  }

  const refreshNotifications = async () => {
    if (user) {
      await fetchNotifications(user.id)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      if (profileData) {
        setProfile(profileData)
      }
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log("[v0] Auth context initializing...")
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()
        console.log("[v0] Session data:", session)
        if (sessionError) {
          console.error("[v0] Session error:", sessionError)
          setLoading(false)
          return
        }

        console.log("[v0] Initial session:", session ? "found" : "not found")
        setUser(session?.user ?? null)
        console.log("[v0] Session user:", session?.user)
        if (session?.user) {
          // Fetch user profile with retry logic
          const profileData = await fetchProfile(session.user.id)
          if (profileData) {
            console.log("[v0] Profile loaded:", profileData.role)
            setProfile(profileData)
            await fetchNotifications(session.user.id)
          } else {
            console.log("[v0] No profile found for user")
          }
        }
      } catch (error) {
        console.error("[v0] Error initializing session:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", event, session?.user?.id)

      setUser(session?.user ?? null)

      if (session?.user) {
        if (event === "SIGNED_IN") {
          // Small delay to ensure profile is created by trigger
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        // Fetch user profile
        const profileData = await fetchProfile(session.user.id)
        if (profileData) {
          console.log("[v0] Profile data:", profileData)
          setProfile(profileData)
          await fetchNotifications(session.user.id)
        } else {
          console.log("[v0] No profile found after auth change")
        }
      } else {
        setProfile(null)
        setNotifications([])
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setNotifications((prev) =>
              prev.map((notif) => (notif.id === payload.new.id ? (payload.new as Notification) : notif)),
            )
          } else if (payload.eventType === "DELETE") {
            setNotifications((prev) => prev.filter((notif) => notif.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setNotifications([])
    } catch (error) {
      console.error("[v0] Sign out error:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        notifications,
        unreadCount,
        loading,
        signOut,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshNotifications,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
