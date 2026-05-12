/**
 * POST /api/kyc/submit - Submit KYC documents
 * Requires PROVIDER role
 * Body: documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl
 * Updates provider kycStatus to 'PENDING'
 */

import { queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, error } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
  params: Record<string, string>;
}

export async function onRequestPost(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'PROVIDER')) {
    return forbidden('Provider access required');
  }

  let body;
  try {
    body = await context.request.json() as {
      documentType?: string;
      documentNumber?: string;
      documentFrontUrl?: string;
      documentBackUrl?: string;
      selfieUrl?: string;
    };
  } catch {
    return error('Invalid request body');
  }

  if (!body.documentType || !body.documentNumber || !body.documentFrontUrl || !body.selfieUrl) {
    return error('documentType, documentNumber, documentFrontUrl, and selfieUrl are required');
  }

  // Validate document type
  const validDocTypes = ['AADHAAR', 'PAN', 'DRIVING_LICENSE', 'PASSPORT'];
  if (!validDocTypes.includes(body.documentType)) {
    return error(`Invalid documentType. Must be one of: ${validDocTypes.join(', ')}`);
  }

  const documentType = sanitizeString(body.documentType);
  const documentNumber = sanitizeString(body.documentNumber);
  const documentFrontUrl = sanitizeString(body.documentFrontUrl);
  const documentBackUrl = body.documentBackUrl ? sanitizeString(body.documentBackUrl) : null;
  const selfieUrl = sanitizeString(body.selfieUrl);

  // Check if provider already has KYC
  const existingKyc = await queryOne(
    context.env.DB,
    'SELECT id, verificationStatus FROM ProviderKyc WHERE providerId = ?',
    [user.userId]
  );

  if (existingKyc) {
    const kycData = existingKyc as { id: string; verificationStatus: string };

    // If already approved, don't allow resubmission
    if (kycData.verificationStatus === 'APPROVED') {
      return error('Your KYC is already verified');
    }

    // If pending, don't allow resubmission
    if (kycData.verificationStatus === 'PENDING') {
      return error('Your KYC verification is already pending');
    }

    // If rejected, allow resubmission by updating existing record
    await execute(
      context.env.DB,
      `UPDATE ProviderKyc
       SET documentType = ?, documentNumber = ?, documentFrontUrl = ?, documentBackUrl = ?, selfieUrl = ?,
           verificationStatus = 'PENDING', verifiedBy = NULL, verifiedAt = NULL, rejectionReason = NULL,
           updatedAt = datetime('now')
       WHERE id = ?`,
      [documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl, kycData.id]
    );

    return json({ message: 'KYC documents resubmitted successfully', kycStatus: 'PENDING' });
  }

  // Create new KYC record
  const kycId = crypto.randomUUID();
  await execute(
    context.env.DB,
    `INSERT INTO ProviderKyc (id, providerId, documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl, verificationStatus, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'), datetime('now'))`,
    [kycId, user.userId, documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl]
  );

  // Notify admins about new KYC submission
  const admins = await queryOne(
    context.env.DB,
    "SELECT id FROM User WHERE roleId = (SELECT id FROM Role WHERE name = 'ADMIN') LIMIT 1"
  );

  if (admins) {
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, isRead, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))`,
      [
        crypto.randomUUID(),
        (admins as { id: string }).id,
        'KYC_SUBMISSION',
        'New KYC Submission',
        `A provider has submitted KYC documents for verification`,
        '/admin/users',
      ]
    );
  }

  return json({ message: 'KYC documents submitted successfully', kycStatus: 'PENDING' }, 201);
}
