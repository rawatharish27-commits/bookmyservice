import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email format').max(254),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  roleId: z.number().int().min(1).max(10),
  specialization: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
