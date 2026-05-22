import { z } from 'zod'

export const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  serviceAddress: z.string().min(1, 'Service address is required').max(500),
  specialInstructions: z.string().max(1000).optional(),
  basePrice: z.number().min(99).max(499).optional(),
  couponCode: z.string().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
