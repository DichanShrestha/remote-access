import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { stripTrailingSlash } from '@/lib/seo'

export async function proxy(request: NextRequest) {
  // Canonical URLs never use a trailing slash. Normalise before auth so
  // /business/about/ and /business/about cannot both be indexed.
  const pathname = request.nextUrl.pathname
  const normalizedPath = stripTrailingSlash(pathname)
  if (normalizedPath !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = normalizedPath
    return NextResponse.redirect(url, 308)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pageory-pathname', request.nextUrl.pathname)
  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/editor')

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml and robots.txt (SEO files)
     * - public files with extensions (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|sitemap-pages|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
