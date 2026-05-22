// ─── services/upload.service.ts ─────────────────────────────────────────
// Pure business logic extracted from routes/upload.routes.ts
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'
import { redis } from '../lib/redis'
import { uploadBuffer, uploadBase64, deleteImage, UploadResult } from '../lib/cloudinary'

// ─── Upload Profile Image ────────────────────────────────────────────

export async function uploadProfileImage(userId: string, contentType: string, body: any): Promise<{
  success: true; message: string; url: string; publicId: string
} | { success: false; error: string; status: number }> {
  let result: UploadResult

  if (contentType.includes('multipart/form-data')) {
    const file = body['file']
    if (!file || !(file instanceof File)) return { success: false, error: 'No file provided', status: 400 }
    const buffer = Buffer.from(await file.arrayBuffer())
    result = await uploadBuffer(buffer, 'profileImage', `profile_${userId}`)
  } else {
    // Base64 upload
    const { image } = body
    if (!image) return { success: false, error: 'No image provided', status: 400 }
    result = await uploadBase64(image, 'profileImage', `profile_${userId}`)
  }

  // Update user's profile image URL
  await pool.query('UPDATE "User" SET "profileImageUrl" = $1, "updatedAt" = NOW() WHERE id = $2', [result.secureUrl, userId])

  // Invalidate caches
  await redis.delByPattern('cache:services:*').catch(() => {})

  return { success: true, message: 'Profile image uploaded', url: result.secureUrl, publicId: result.publicId }
}

// ─── Upload Service Image ────────────────────────────────────────────

export async function uploadServiceImage(userId: string, data: { serviceId?: string; image: string }): Promise<{
  success: true; message: string; url: string; publicId: string
} | { success: false; error: string; status: number }> {
  const { serviceId, image } = data
  if (!image) return { success: false, error: 'No image provided', status: 400 }

  const result = await uploadBase64(image, 'serviceImage', serviceId ? `svc_${serviceId}_${Date.now()}` : `svc_${Date.now()}`)

  // Invalidate service caches
  await redis.delByPattern('cache:services:*').catch(() => {})

  return { success: true, message: 'Service image uploaded', url: result.secureUrl, publicId: result.publicId }
}

// ─── Upload KYC Documents ────────────────────────────────────────────

export async function uploadKycDocuments(userId: string, data: {
  documentFront?: string; selfie?: string; documentType?: string; documentNumber?: string
}): Promise<{
  success: true; message: string; documentFrontUrl?: string; selfieUrl?: string; status: string
} | { success: false; error: string; status: number }> {
  const { documentFront, selfie, documentType, documentNumber } = data
  if (!documentFront && !selfie) return { success: false, error: 'At least one document image is required', status: 400 }

  const results: { documentFrontUrl?: string; selfieUrl?: string } = {}

  if (documentFront) {
    const docResult = await uploadBase64(documentFront, 'kycDocument', `kyc_doc_${userId}`)
    results.documentFrontUrl = docResult.secureUrl
  }

  if (selfie) {
    const selfieResult = await uploadBase64(selfie, 'kycDocument', `kyc_selfie_${userId}`)
    results.selfieUrl = selfieResult.secureUrl
  }

  // Update KYC record
  const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query(
    'INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, \'PENDING\', NOW(), NOW()) ON CONFLICT ("providerId") DO UPDATE SET "documentType" = $3, "documentNumber" = $4, "documentFrontUrl" = COALESCE($5, "ProviderKyc"."documentFrontUrl"), "selfieUrl" = COALESCE($6, "ProviderKyc"."selfieUrl"), "verificationStatus" = \'PENDING\', "updatedAt" = NOW()',
    [kycId, userId, documentType || 'AADHAAR', documentNumber || '', results.documentFrontUrl || null, results.selfieUrl || null]
  )

  return { success: true, message: 'KYC documents uploaded', ...results, status: 'PENDING' }
}

// ─── Delete Uploaded Image ───────────────────────────────────────────

export async function deleteUploadedImage(userId: string, publicId: string): Promise<{
  message: string; deleted: boolean
}> {
  const deleted = await deleteImage(publicId)
  return { message: deleted ? 'Image deleted' : 'Image not found', deleted }
}
