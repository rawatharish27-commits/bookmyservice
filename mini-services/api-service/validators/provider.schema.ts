import { z } from 'zod'

// ─── Provider Schema ───────────────────────────────────────────────────
// Validates provider/service creation request body
// Never trust frontend input — all provider inputs must be validated server-side.

export const createServiceSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title is required')
    .max(200, 'Title exceeds maximum length of 200 characters')
    .transform((val) => val.trim()),

  description: z
    .string()
    .max(5000, 'Description exceeds maximum length of 5000 characters')
    .optional(),

  categoryId: z
    .number({ required_error: 'Category is required', invalid_type_error: 'Category must be a number' })
    .int('Category must be an integer')
    .positive('Invalid category'),

  subcategoryId: z
    .number()
    .int('Subcategory must be an integer')
    .positive('Invalid subcategory')
    .optional(),

  basePrice: z
    .number({ required_error: 'Base price is required', invalid_type_error: 'Base price must be a number' })
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price exceeds maximum allowed value'),

  images: z
    .union([
      z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images allowed'),
      z.string().url('Invalid image URL'),
    ])
    .optional(),

  serviceDurationMinutes: z
    .number()
    .int('Duration must be a whole number')
    .min(15, 'Minimum service duration is 15 minutes')
    .max(480, 'Maximum service duration is 8 hours')
    .optional(),

  isEmergencyAvailable: z
    .boolean()
    .optional(),
})

export const updateServiceSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title exceeds maximum length of 200 characters')
    .optional(),

  description: z
    .string()
    .max(5000, 'Description exceeds maximum length of 5000 characters')
    .optional(),

  basePrice: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price exceeds maximum allowed value')
    .optional(),

  images: z
    .union([
      z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images allowed'),
      z.string().url('Invalid image URL'),
    ])
    .optional(),

  serviceDurationMinutes: z
    .number()
    .int('Duration must be a whole number')
    .min(15, 'Minimum service duration is 15 minutes')
    .max(480, 'Maximum service duration is 8 hours')
    .optional(),

  isEmergencyAvailable: z
    .boolean()
    .optional(),

  isActive: z
    .boolean()
    .optional(),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
