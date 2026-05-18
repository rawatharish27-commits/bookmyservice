import { z, ZodError } from 'zod'
import type { Context } from 'hono'

// ─── Zod Validation Middleware for Hono ─────────────────────────────────
// Flow: Request → Zod Validation → Controller → Database
// This middleware validates request bodies against Zod schemas
// before they reach the controller, ensuring we never trust frontend input.

interface ValidationError {
  field: string
  message: string
}

/**
 * Format Zod validation errors into a clean, user-friendly structure.
 * Converts Zod's internal error tree into a flat array of { field, message } objects.
 */
function formatZodErrors(error: ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }))
}

/**
 * Validate request body against a Zod schema.
 * Returns validated + transformed data on success, or a formatted 400 response on failure.
 *
 * Usage in a route handler:
 *   const result = await validateBody(c, loginSchema)
 *   if (!result.success) return result.response
 *   const { email, password } = result.data
 */
export async function validateBody<T extends z.ZodTypeAny>(
  c: Context,
  schema: T
): Promise<
  | { success: true; data: z.infer<T> }
  | { success: false; response: Response }
> {
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error)
      return {
        success: false,
        response: c.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
          400
        ),
      }
    }
    // Non-Zod error (e.g., invalid JSON)
    return {
      success: false,
      response: c.json(
        {
          error: 'Invalid request body',
          code: 'INVALID_BODY',
        },
        400
      ),
    }
  }
}

/**
 * Create a Hono middleware that validates the request body against a Zod schema.
 * On success, attaches validated data to c.set('validatedBody', data).
 * On failure, returns 400 with validation error details.
 *
 * Usage:
 *   app.post('/api/auth/login', validateMiddleware(loginSchema), async (c) => {
 *     const body = c.get('validatedBody')
 *     // body is already validated and typed
 *   })
 */
export function validateMiddleware<T extends z.ZodTypeAny>(schema: T) {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      const body = await c.req.json()
      const data = schema.parse(body)
      c.set('validatedBody', data)
      await next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error)
        c.json(
          {
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
          400
        )
        return
      }
      c.json(
        {
          error: 'Invalid request body',
          code: 'INVALID_BODY',
        },
        400
      )
      return
    }
  }
}
