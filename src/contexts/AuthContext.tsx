"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  role: "user" | "amer"
  name: string
  phone?: string
  trialUsed: boolean
  stripeCustomerId: string
  stripeSubscriptionId: string
  subscriptionStatus: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  checkRole: (role: string) => boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => void
  resetPassword: (email: string) => Promise<void>
  fetchTrial: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          // TODO: Verify token with backend
          // For now, we'll simulate a user session
          const userData = localStorage.getItem('userData')
          if (userData) {
            setUser(JSON.parse(userData))
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])
  const fetchTrial = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        console.log('Fetch trial data:', data)
        if (data.success) {
          setUser({
            ...data.data.user,
            trialUsed: data.data.user.trialUsed || false,
          })
            localStorage.setItem('userData', JSON.stringify({
              ...data.data.user,
              trialUsed: data.data.user.trialUsed || false,
            }))
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Fetch trial error:', error)
      localStorage.removeItem('authToken')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    // Fetch trial used on mount
    fetchTrial()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      const userData: User = {
        id: data.data.user.id,
        email: data.data.user.email,
        role: data.data.user.role,
        name: data.data.user.firstName + ' ' + data.data.user.lastName,
        phone: data.data.user.phoneNumber || data.data.user.phone || '',
        trialUsed: data.data.user.trialUsed || false,
        stripeCustomerId: data.data.user.stripeCustomerId || '',
        stripeSubscriptionId: data.data.user.stripeSubscriptionId || '',
        subscriptionStatus: data.data.user.subscriptionStatus || '',
      }

      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('userData', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string, additionalData?: any) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          firstName: additionalData?.firstName || name.split(' ')[0],
          lastName: additionalData?.lastName || name.split(' ').slice(1).join(' ') || '',
          phoneNumber: additionalData?.phoneNumber || '',
          role: additionalData?.role || 'user'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      const userData: User = {
        id: data.data.user?.id,
        email: data.data.user?.email,
        role: data.data.user?.role,
        name: data.data.user?.firstName + ' ' + data.data.user?.lastName,
        phone: data.data.user?.phoneNumber || data.data.user?.phone || additionalData?.phoneNumber || '',
        trialUsed: data.data.user?.trialUsed || false,
        stripeCustomerId: data.data.user?.stripeCustomerId || '',
        stripeSubscriptionId: data.data.user?.stripeSubscriptionId || '',
        subscriptionStatus: data.data.user?.subscriptionStatus || '',
      }

      localStorage.setItem('authToken', data.data.token)
      localStorage.setItem('userData', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signOut = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setUser(null)
  }

  const resetPassword = async (email: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send reset email')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  const checkRole = (role: string) => {
    const userData = localStorage.getItem('userData')
    const user = userData ? JSON.parse(userData) : null
    if (user?.role === 'amer') {
      return true
    } else if (user?.role === 'user') {
      return true
    } else {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        fetchTrial,
        resetPassword,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}