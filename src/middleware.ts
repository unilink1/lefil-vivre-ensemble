import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({ request })

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
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    const isProtectedRoute =
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/onboarding')

    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/connexion'
      return NextResponse.redirect(url)
    }

    const isAuthRoute = pathname === '/connexion' || pathname === '/inscription'

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/profil'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    // If middleware crashes, let the request through
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/connexion',
    '/inscription',
  ],
}
