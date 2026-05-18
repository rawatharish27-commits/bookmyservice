import { z } from 'zod'

// ─── Create Booking Schema ─────────────────────────────────────────────
// Validates booking creation request body
// Never trust frontend input — all booking inputs must be validated server-side.

export const createBookingSchema = z.object({
  serviceId: z
    .string({ required_error: 'Service ID is required' })
    .min(1, 'Service ID is required')
    .max(50, 'Service ID exceeds maximum length'),

  providerId: z
    .string()
    .max(50, 'Provider ID exceeds maximum length')
    .optional(),

  technicianId: z
    .string()
    .max(50, 'Technician ID exceeds maximum length')
    .optional(),

  scheduledDate: z
    .string({ required_error: 'Scheduled date is required' })
    .min(1, 'Scheduled date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine(
      (val) => {
        const date = new Date(val)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date >= today
      },
      { message: 'Scheduled date cannot be in the past' }
    ),

  scheduledTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
    .optional(),

  address: z
    .string({ required_error: 'Address is required' })
    .min(1, 'Address is required')
    .max(500, 'Address exceeds maximum length of 500 characters')
    .transform((val) => val.trim()),

  lat: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),

  lng: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),

  notes: z
    .string()
    .max(1000, 'Notes exceed maximum length of 1000 characters')
    .optional(),

  couponId: z
    .string()
    .max(50, 'Coupon ID exceeds maximum length')
    .optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
