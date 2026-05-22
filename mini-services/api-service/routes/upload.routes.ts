// ─── routes/upload.routes.ts ───────────────────────────────────────────
// All /api/upload/* endpoints — Cloudinary CDN Upload Integration
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { pool, getAuthUser } from '../lib/shared'
import { redis } from '../lib/redis'
import { uploadBuffer, uploadBase64, deleteImage, getCloudinaryStatus, UploadResult } from '../lib/cloudinary'
import { getQueueStatus } from '../queues'

const router = new Hono()

// ============================================================
// CLOUDINARY CDN UPLOAD ENDPOINTS
// ============================================================

// POST /api/upload/profile - Upload provider profile image
router.post('/api/upload/profile', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const contentType = c.req.header('content-type') || ''

    let result: UploadResult

    if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody()
      const file = body['file']
      if (!file || !(file instanceof File)) return c.json({ error: 'No file provided' }, 400)
      const buffer = Buffer.from(await file.arrayBuffer())
      result = await uploadBuffer(buffer, 'profileImage', `profile_${user.id}`)
    } else {
      // Base64 upload
      const { image } = await c.req.json()
      if (!image) return c.json({ error: 'No image provided' }, 400)
      result = await uploadBase64(image, 'profileImage', `profile_${user.id}`)
    }

    // Update user's profile image URL
    await pool.query('UPDATE "User" SET "profileImageUrl" = $1, "updatedAt" = NOW() WHERE id = $2', [result.secureUrl, user.id])

    // Invalidate caches
    await redis.delByPattern('cache:services:*').catch(() => {})

    return c.json({ message: 'Profile image uploaded', url: result.secureUrl, publicId: result.publicId })
  } catch (e: any) {
    console.error('Upload profile error:', e)
    return c.json({ error: 'Failed to upload profile image' }, 500)
  }
})

// POST /api/upload/service - Upload service images
router.post('/api/upload/service', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (user.roleId !== 2 && user.role !== 'PROVIDER') return c.json({ error: 'Only providers can upload service images' }, 403)

    const { serviceId, image } = await c.req.json()
    if (!image) return c.json({ error: 'No image provided' }, 400)

    const result = await uploadBase64(image, 'serviceImage', serviceId ? `svc_${serviceId}_${Date.now()}` : `svc_${Date.now()}`)

    // Invalidate service caches
    await redis.delByPattern('cache:services:*').catch(() => {})

    return c.json({ message: 'Service image uploaded', url: result.secureUrl, publicId: result.publicId })
  } catch (e: any) {
    console.error('Upload service error:', e)
    return c.json({ error: 'Failed to upload service image' }, 500)
  }
})

// POST /api/upload/kyc - Upload KYC documents
router.post('/api/upload/kyc', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)

    const { documentFront, selfie, documentType, documentNumber } = await c.req.json()
    if (!documentFront && !selfie) return c.json({ error: 'At least one document image is required' }, 400)

    const results: { documentFrontUrl?: string; selfieUrl?: string } = {}

    if (documentFront) {
      const docResult = await uploadBase64(documentFront, 'kycDocument', `kyc_doc_${user.id}`)
      results.documentFrontUrl = docResult.secureUrl
    }

    if (selfie) {
      const selfieResult = await uploadBase64(selfie, 'kycDocument', `kyc_selfie_${user.id}`)
      results.selfieUrl = selfieResult.secureUrl
    }

    // Update KYC record
    const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
    await pool.query(
      'INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, \'PENDING\', NOW(), NOW()) ON CONFLICT ("providerId") DO UPDATE SET "documentType" = $3, "documentNumber" = $4, "documentFrontUrl" = COALESCE($5, "ProviderKyc"."documentFrontUrl"), "selfieUrl" = COALESCE($6, "ProviderKyc"."selfieUrl"), "verificationStatus" = \'PENDING\', "updatedAt" = NOW()',
      [kycId, user.id, documentType || 'AADHAAR', documentNumber || '', results.documentFrontUrl || null, results.selfieUrl || null]
    )

    return c.json({ message: 'KYC documents uploaded', ...results, status: 'PENDING' })
  } catch (e: any) {
    console.error('Upload KYC error:', e)
    return c.json({ error: 'Failed to upload KYC documents' }, 500)
  }
})

// DELETE /api/upload/:publicId - Delete an uploaded image
router.delete('/api/upload/:publicId', async (c) => {
  try {
    const user = await getAuthUser(c)
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    const publicId = decodeURIComponent(c.req.param('publicId'))
    const deleted = await deleteImage(publicId)
    return c.json({ message: deleted ? 'Image deleted' : 'Image not found', deleted })
  } catch (e: any) {
    console.error('Delete image error:', e)
    return c.json({ error: 'Failed to delete image' }, 500)
  }
})

// GET /api/upload/status - Check Cloudinary configuration status
router.get('/api/upload/status', (c) => {
  return c.json({ upload: getCloudinaryStatus(), queue: getQueueStatus() })
})

export const uploadRoutes = router
