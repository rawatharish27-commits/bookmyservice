import { z } from 'zod'

export const createServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  categoryId: z.number().int().min(1),
  subcategoryId: z.number().int().optional(),
  basePrice: z.number().min(99, 'Price must be at least ₹99').max(499, 'Price must not exceed ₹499'),
  images: z.array(z.string().url()).max(5).optional(),
  serviceDurationMinutes: z.number().int().min(15).max(480).optional(),
  isEmergencyAvailable: z.boolean().optional(),
})

export const updateServiceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  categoryId: z.number().int().min(1).optional(),
  subcategoryId: z.number().int().optional(),
  basePrice: z.number().min(99, 'Price must be at least ₹99').max(499, 'Price must not exceed ₹499').optional(),
  images: z.array(z.string().url()).max(5).optional(),
  serviceDurationMinutes: z.number().int().min(15).max(480).optional(),
  isEmergencyAvailable: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
