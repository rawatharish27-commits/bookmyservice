// ─── routes/upload.routes.ts ───────────────────────────────────────────
// All /api/upload/* endpoints — Cloudinary CDN Upload Integration
// Refactored: thin handlers that delegate to upload.service
// ─────────────────────────────────────────────────────────────────────

import { Hono } from 'hono'
import { getAuthUser } from '../lib/shared'
import { getCloudinaryStatus } from '../lib/cloudinary'
import { getQueueStatus } from '../queues'
import * as uploadService from '../services/upload.service'

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

    let body: any
    if (contentType.includes('multipart/form-data')) {
      body = await c.req.parseBody()
    } else {
      body = await c.req.json()
    }

    const result = await uploadService.uploadProfileImage(user.id, contentType, body)
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: result.message, url: result.url, publicId: result.publicId })
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
    const result = await uploadService.uploadServiceImage(user.id, { serviceId, image })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: result.message, url: result.url, publicId: result.publicId })
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
    const result = await uploadService.uploadKycDocuments(user.id, { documentFront, selfie, documentType, documentNumber })
    if (!result.success) return c.json({ error: result.error }, result.status)
    return c.json({ message: result.message, ...({ documentFrontUrl: (result as any).documentFrontUrl, selfieUrl: (result as any).selfieUrl }), status: result.status })
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
    const result = await uploadService.deleteUploadedImage(user.id, publicId)
    return c.json(result)
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
