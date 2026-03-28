import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // CSRF-like protection: verify Origin header on mutating requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin && host) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return new NextResponse('Forbidden: Origin mismatch', { status: 403 })
      }
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — important for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected routes: redirect to /connexion if not authenticated
  // Admin has its own code-based auth (layout.tsx), no middleware redirect needed
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding')

  if (!user && isProtectedRoute) {
    // Prevent infinite redirect: only redirect if not already heading to /connexion
    if (pathname !== '/connexion') {
      const url = request.nextUrl.clone()
      url.pathname = '/connexion'
      return NextResponse.redirect(url)
    }
  }

  // Auth routes: redirect to /dashboard/profil if already authenticated
  const isAuthRoute = pathname === '/connexion' || pathname === '/inscription'

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard/profil'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    // Admin uses its own code auth via layout.tsx
    '/connexion',
    '/inscription',
  ],
}
