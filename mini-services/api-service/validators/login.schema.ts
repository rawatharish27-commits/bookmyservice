import { z } from 'zod'

// ─── Login Schema ──────────────────────────────────────────────────────
// Validates login request body: email + password
// Never trust frontend input — all auth inputs must be validated server-side.

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .max(254, 'Email exceeds maximum length of 254 characters')
    .email('Invalid email format')
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .max(128, 'Password exceeds maximum length of 128 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
