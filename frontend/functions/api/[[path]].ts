/**
 * Cloudflare Pages Function — API Proxy
 *
 * Proxies ALL /api/* requests to the Render backend.
 * This is needed because Cloudflare Pages _redirects with 200 status
 * only supports GET/HEAD — POST/PUT/PATCH/DELETE return 405.
 *
 * Cloudflare Pages Functions run on Cloudflare Workers runtime,
 * supporting all HTTP methods with sub-ms cold starts.
 */

// The Render backend URL
const API_BACKEND = 'https://servicebooking-u2wa.onrender.com'

// Headers that should NOT be forwarded (hop-by-hop headers)
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'transfer-encoding',
  'te', 'trailer', 'upgrade', 'host',
])

// CORS headers added to every response
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Refresh-Token',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}

interface PagesFunctionEnv {
  API_BACKEND_URL?: string
}

export async function onRequest(context: {
  request: Request
  env: PagesFunctionEnv
  params: Record<string, string | string[]>
  waitUntil: (promise: Promise<any>) => void
}): Promise<Response> {
  const { request, env } = context

  // Handle CORS preflight (OPTIONS) directly — no backend call needed
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  // Determine backend URL (env var overrides default)
  const backendUrl = env.API_BACKEND_URL || API_BACKEND

  // Build target URL preserving path + query
  const url = new URL(request.url)
  const targetUrl = `${backendUrl}${url.pathname}${url.search}`

  // Forward request headers (skip hop-by-hop)
  const headers = new Headers()
  for (const [key, value] of request.headers.entries()) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  }
  // Set proper Host for the backend
  headers.set('Host', new URL(backendUrl).host)

  try {
    // Forward the request to the Render backend
    const backendResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-expect-error — duplex needed for streaming request body in Workers runtime
      duplex: 'half',
    })

    // Build response headers (skip hop-by-hop from backend)
    // Use append() instead of set() to preserve multiple Set-Cookie headers
    const responseHeaders = new Headers()
    for (const [key, value] of backendResponse.headers.entries()) {
      if (!HOP_BY_HOP.has(key.toLowerCase())) {
        responseHeaders.append(key, value)
      }
    }

    // Add CORS headers
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      responseHeaders.set(key, value)
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: responseHeaders,
    })
  } catch (err: any) {
    // Backend unreachable
    return new Response(
      JSON.stringify({
        error: 'API service unavailable',
        message: 'Unable to reach the backend service. Please try again later.',
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    )
  }
}
