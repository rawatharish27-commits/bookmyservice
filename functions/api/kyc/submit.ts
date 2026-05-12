import { queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'PROVIDER') return error('Only providers can submit KYC', 403);

    const body = await context.request.json() as {
      documentType: string; documentNumber: string;
      documentFrontUrl: string; documentBackUrl?: string; selfieUrl: string;
    };

    if (!body.documentType || !body.documentNumber || !body.documentFrontUrl || !body.selfieUrl) {
      return error('documentType, documentNumber, documentFrontUrl, and selfieUrl are required', 400);
    }

    // Check if already submitted
    const existing = await queryOne(context.env.DB,
      'SELECT id, verificationStatus FROM ProviderKyc WHERE providerId = ?', [auth.userId]
    );

    if (existing) {
      if (existing.verificationStatus === 'PENDING') {
        return error('KYC already submitted and pending review', 409);
      }
      if (existing.verificationStatus === 'APPROVED') {
        return error('KYC already approved', 409);
      }
      // Update if rejected
      await execute(context.env.DB, `
        UPDATE ProviderKyc SET documentType = ?, documentNumber = ?, documentFrontUrl = ?, documentBackUrl = ?,
          selfieUrl = ?, verificationStatus = 'PENDING', rejectionReason = NULL, updatedAt = datetime("now")
        WHERE providerId = ?
      `, [body.documentType, body.documentNumber, body.documentFrontUrl, body.documentBackUrl || null, body.selfieUrl, auth.userId]);

      return json({ message: 'KYC resubmitted successfully', status: 'PENDING' });
    }

    const id = crypto.randomUUID();
    await execute(context.env.DB, `
      INSERT INTO ProviderKyc (id, providerId, documentType, documentNumber, documentFrontUrl, documentBackUrl,
        selfieUrl, verificationStatus, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime("now"), datetime("now"))
    `, [id, auth.userId, body.documentType, body.documentNumber, body.documentFrontUrl,
        body.documentBackUrl || null, body.selfieUrl]);

    return json({ message: 'KYC submitted successfully', status: 'PENDING' }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
