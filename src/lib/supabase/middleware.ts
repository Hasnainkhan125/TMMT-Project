import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase environment variables in middleware")
    return NextResponse.next({ request })
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  console.log("[v0] Middleware checking path:", request.nextUrl.pathname)

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] Middleware user error:", userError)
      // Continue with unauthenticated user
    }

    console.log("[v0] Middleware user:", user ? "authenticated" : "not authenticated")

    const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
    const isHomePage = request.nextUrl.pathname === "/"
    const isGuestApplicationPage = request.nextUrl.pathname.startsWith("/applicant/applications/new")
    const isPublicPage = isAuthPage || isHomePage || isGuestApplicationPage

    // Only redirect to login if user is not authenticated AND trying to access protected pages
    if (!user && !isPublicPage) {
      console.log("[v0] Redirecting to login from:", request.nextUrl.pathname)
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // If user is authenticated and on auth pages, redirect to appropriate dashboard
    if (
      user &&
      isAuthPage &&
      request.nextUrl.pathname !== "/auth/verify" &&
      request.nextUrl.pathname !== "/auth/pending-approval"
    ) {
      console.log("[v0] Authenticated user on auth page, redirecting to dashboard")
      
      // Try to get user profile for role-based redirect
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile) {
          let redirectPath = "/"
          switch (profile.role) {
            case "applicant":
              redirectPath = "/applicant/dashboard"
              break
            case "officer":
              redirectPath = "/officer/dashboard"
              break
            case "admin":
              redirectPath = "/admin/dashboard"
              break
            case "pending_officer":
              redirectPath = "/auth/pending-approval"
              break
          }
          
          const url = request.nextUrl.clone()
          url.pathname = redirectPath
          return NextResponse.redirect(url)
        }
      } catch (profileError) {
        console.error("[v0] Profile fetch error in middleware:", profileError)
        // Fallback to home page
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    }

    // Handle role-based access control for protected routes
    if (user && !isPublicPage) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profile) {
          const path = request.nextUrl.pathname
          
          // Check if user is trying to access a route they don't have permission for
          if (path.startsWith("/admin") && profile.role !== "admin") {
            console.log("[v0] Non-admin user trying to access admin route")
            const url = request.nextUrl.clone()
            url.pathname = "/"
            return NextResponse.redirect(url)
          }
          
          if (path.startsWith("/officer") && !["officer", "admin"].includes(profile.role)) {
            console.log("[v0] Non-officer user trying to access officer route")
            const url = request.nextUrl.clone()
            url.pathname = "/"
            return NextResponse.redirect(url)
          }
          
          if (path.startsWith("/applicant") && profile.role !== "applicant") {
            console.log("[v0] Non-applicant user trying to access applicant route")
            const url = request.nextUrl.clone()
            url.pathname = "/"
            return NextResponse.redirect(url)
          }
        }
      } catch (profileError) {
        console.error("[v0] Profile fetch error for access control:", profileError)
        // If we can't verify the profile, redirect to home
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    // On error, allow the request to continue
    return NextResponse.next({ request })
  }
}
