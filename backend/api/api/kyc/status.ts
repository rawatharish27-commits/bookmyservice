/**
 * GET /api/kyc/status - Get KYC status
 * Requires PROVIDER role
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden } from '../../_shared/response';

interface EventContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'PROVIDER')) {
    return forbidden('Provider access required');
  }

  const supabase = createSupabaseClient(context.env);

  const { data: kycRecord } = await supabase
    .from('ProviderKyc')
    .select('id,documentType,documentNumber,verificationStatus,rejectionReason,verifiedBy,verifiedAt,createdAt,updatedAt')
    .eq('providerId', user.userId)
    .maybeSingle();

  if (!kycRecord) {
    return json({
      kycStatus: 'NOT_SUBMITTED',
      kyc: null,
      message: 'No KYC documents submitted yet',
    });
  }

  const kycData = kycRecord as {
    id: string;
    documentType: string;
    documentNumber: string;
    verificationStatus: string;
    rejectionReason: string | null;
    verifiedBy: string | null;
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  return json({
    kycStatus: kycData.verificationStatus,
    kyc: {
      id: kycData.id,
      documentType: kycData.documentType,
      // Mask document number for security
      documentNumber: kycData.documentNumber.slice(0, 2) + '****' + kycData.documentNumber.slice(-2),
      verificationStatus: kycData.verificationStatus,
      rejectionReason: kycData.rejectionReason,
      verifiedAt: kycData.verifiedAt,
      createdAt: kycData.createdAt,
    },
  });
}
