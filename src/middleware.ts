import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tlqvxurmrpiuczlinyve.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRscXZ4dXJtcnBpdWN6bGlueXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODIyMDUsImV4cCI6MjA5MDA1ODIwNX0.TA83e0Etn2kLp9XE5PbiZ1dfwB4-NdxXZKFtjlUoZnU'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/',
  '/connexion',
  '/inscription',
  '/partage',
  '/mot-de-passe-oublie',
  '/admin',
]

function isPublicRoute(pathname: string): boolean {
  // Exact match for landing page
  if (pathname === '/') return true

  // Check if the pathname starts with any public route prefix
  return PUBLIC_ROUTES.some(
    (route) =>
      route !== '/' &&
      (pathname === route || pathname.startsWith(route + '/'))
  )
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Allow public routes through immediately
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }

    // Only protect /dashboard/* and /onboarding/* routes
    const isProtected =
      pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')

    if (!isProtected) {
      return NextResponse.next()
    }

    // Create a response we can modify (to set cookies)
    let response = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies for downstream
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          // Rebuild response with updated request
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          // Set cookies on the response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // This refreshes the session if needed and returns current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // No authenticated user -> redirect to login
    if (!user) {
      const redirectUrl = new URL('/connexion', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch {
    // If middleware crashes for any reason, let the request through
    // so we never block users due to an infrastructure issue
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*'],
}
