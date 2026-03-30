import { NextResponse } from 'next/server'

// Middleware désactivé — la protection des routes est gérée côté client
// via useAuth dans chaque page qui en a besoin
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
