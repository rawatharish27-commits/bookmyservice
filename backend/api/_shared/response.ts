/**
 * Standardized API response helpers.
 */

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function error(message: string, status = 400, details?: unknown): Response {
  return json({ error: message, ...(details ? { details } : {}) }, status);
}

export function unauthorized(message = 'Authentication required'): Response {
  return error(message, 401);
}

export function forbidden(message = 'Access denied'): Response {
  return error(message, 403);
}

export function notFound(message = 'Resource not found'): Response {
  return error(message, 404);
}

export function tooManyRequests(message = 'Too many requests. Please try again later.'): Response {
  return error(message, 429);
}

export function serverError(message = 'Internal server error'): Response {
  return error(message, 500);
}
