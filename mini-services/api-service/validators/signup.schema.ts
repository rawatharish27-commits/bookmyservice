import { z } from 'zod'

// ─── Signup Schema ─────────────────────────────────────────────────────
// Validates registration request body: email, phone, name, password, roleId, specialization
// Never trust frontend input — all auth inputs must be validated server-side.

// Allowed roles for self-registration (CLIENT=1, PROVIDER=2, TECHNICIAN=4, VENDOR=5)
const ALLOWED_REGISTER_ROLES = [1, 2, 4, 5] as const

export const signupSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .min(1, 'Email is required')
      .max(254, 'Email exceeds maximum length of 254 characters')
      .email('Invalid email format')
      .transform((val) => val.toLowerCase().trim()),

    phone: z
      .string({ required_error: 'Phone is required' })
      .min(1, 'Phone is required')
      .max(15, 'Phone exceeds maximum length of 15 characters')
      .regex(/^[+]?[\d\s-]{6,15}$/, 'Invalid phone number format')
      .transform((val) => val.trim()),

    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name is required')
      .max(100, 'Name exceeds maximum length of 100 characters')
      .transform((val) => val.trim()),

    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password exceeds maximum length of 128 characters'),

    roleId: z
      .number({ required_error: 'Role is required', invalid_type_error: 'Role must be a number' })
      .int('Role must be an integer')
      .min(1, 'Invalid role')
      .refine((val) => ALLOWED_REGISTER_ROLES.includes(val as any), {
        message: 'Registration not allowed for this role',
      }),

    specialization: z
      .string()
      .max(100, 'Specialization exceeds maximum length of 100 characters')
      .optional(),
  })
  .refine(
    // specialization is required when roleId is TECHNICIAN (4)
    (data) => {
      if (data.roleId === 4 && !data.specialization) return false
      return true
    },
    { message: 'Specialization is required for technician role', path: ['specialization'] }
  )

export type SignupInput = z.infer<typeof signupSchema>
