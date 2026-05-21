import type { Context } from 'hono'
import { z, ZodSchema } from 'zod'

interface ValidationResult<T> {
  success: boolean
  data: T
  response?: Response
}

export async function validateBody<T>(c: Context, schema: ZodSchema<T>): Promise<ValidationResult<T>> {
  try {
    const body = await c.req.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.errors[0]
      return {
        success: false,
        data: {} as T,
        response: c.json({
          error: firstError?.message || 'Validation failed',
          details: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        }, 400),
      }
    }
    return {
      success: false,
      data: {} as T,
      response: c.json({ error: 'Invalid request body' }, 400),
    }
  }
}
