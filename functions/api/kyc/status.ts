import { queryOne } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'PROVIDER') return error('Only providers can access KYC', 403);

    const kyc = await queryOne(context.env.DB,
      'SELECT * FROM ProviderKyc WHERE providerId = ?', [auth.userId]
    );

    if (!kyc) {
      return json({ kyc: null, status: 'NOT_SUBMITTED' });
    }

    return json({
      kyc: {
        id: kyc.id,
        documentType: kyc.documentType,
        documentNumber: kyc.documentNumber,
        documentFrontUrl: kyc.documentFrontUrl,
        documentBackUrl: kyc.documentBackUrl,
        selfieUrl: kyc.selfieUrl,
        verificationStatus: kyc.verificationStatus,
        rejectionReason: kyc.rejectionReason,
        verifiedAt: kyc.verifiedAt,
        createdAt: kyc.createdAt,
      },
      status: kyc.verificationStatus,
    });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
