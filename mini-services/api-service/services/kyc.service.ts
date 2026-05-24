// ─── services/kyc.service.ts ──────────────────────────────────────────
// Pure business logic extracted from routes/booking.routes.ts (KYC section)
// ─────────────────────────────────────────────────────────────────────

import { pool } from '../lib/shared'

// ─── Get KYC ──────────────────────────────────────────────────────────

export async function getKyc(userId: string): Promise<{
  kyc: any
}> {
  const result = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [userId]).catch(() => ({ rows: [] }))
  if (!result.rows[0]) return { kyc: { status: 'NOT_SUBMITTED', providerId: userId } }
  return { kyc: result.rows[0] }
}

// ─── Submit KYC ───────────────────────────────────────────────────────

export async function submitKyc(userId: string, data: { documentType: string; documentNumber: string; documentFrontUrl: string; documentBackUrl?: string; selfieUrl?: string }): Promise<{
  success: true; kyc: any; message: string; created?: boolean
} | { success: false; error: string; status: number }> {
  const { documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl } = data
  if (!documentType || !documentNumber || !documentFrontUrl) return { success: false, error: 'documentType, documentNumber, and documentFrontUrl are required', status: 400 }
  const existing = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [userId]).catch(() => ({ rows: [] }))
  if (existing.rows[0]) {
    await pool.query('UPDATE "ProviderKyc" SET "documentType" = $1, "documentNumber" = $2, "documentFrontUrl" = $3, "documentBackUrl" = $4, "selfieUrl" = $5, "verificationStatus" = \'PENDING\', "updatedAt" = NOW() WHERE "providerId" = $6', [documentType, documentNumber, documentFrontUrl, documentBackUrl || null, selfieUrl || null, userId])
    return { success: true, kyc: { providerId: userId, verificationStatus: 'PENDING' }, message: 'KYC updated, pending verification' }
  }
  const id = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "documentBackUrl", "selfieUrl", "verificationStatus", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, \'PENDING\', NOW(), NOW())', [id, userId, documentType, documentNumber, documentFrontUrl, documentBackUrl || null, selfieUrl || null])
  return { success: true, kyc: { id, providerId: userId, verificationStatus: 'PENDING' }, message: 'KYC submitted, pending verification', created: true }
}

// ─── Get KYC Status ───────────────────────────────────────────────────

export async function getKycStatus(userId: string): Promise<{
  kyc: any
}> {
  const result = await pool.query('SELECT * FROM "ProviderKyc" WHERE "providerId" = $1', [userId]).catch(() => ({ rows: [] }))
  return { kyc: result.rows[0] || { verificationStatus: 'PENDING' } }
}

// ─── Submit KYC Form (upsert) ─────────────────────────────────────────

export async function submitKycForm(userId: string, data: any): Promise<{
  message: string; status: string
}> {
  const kycId = 'kyc_' + crypto.randomUUID().replace(/-/g, '').slice(0, 20)
  await pool.query('INSERT INTO "ProviderKyc" (id, "providerId", "documentType", "documentNumber", "documentFrontUrl", "selfieUrl", "verificationStatus") VALUES ($1, $2, $3, $4, $5, $6, \'PENDING\') ON CONFLICT ("providerId") DO UPDATE SET "documentType" = $3, "documentNumber" = $4, "documentFrontUrl" = $5, "selfieUrl" = $6, "verificationStatus" = \'PENDING\', "updatedAt" = NOW()', [kycId, userId, data.documentType || 'AADHAAR', data.documentNumber || '', data.documentFrontUrl || '/pending', data.selfieUrl || '/pending'])
  return { message: 'KYC submitted successfully', status: 'PENDING' }
}
