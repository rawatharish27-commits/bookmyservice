import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers for all responses
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')

  // Cache static assets
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // No cache for API and HTML
  if (request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.endsWith('.html')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
