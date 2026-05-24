/**
 * POST /api/kyc/submit - Submit KYC documents
 * Requires PROVIDER role
 * Body: documentType, documentNumber, documentFrontUrl, documentBackUrl, selfieUrl
 * Updates provider kycStatus to 'PENDING'
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, unauthorized, forbidden, error } from '../../_shared/response';
import { sanitizeString } from '../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
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

  const supabase = createSupabaseClient(context.env);

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
  const { data: existingKyc } = await supabase
    .from('ProviderKyc')
    .select('id,verificationStatus')
    .eq('providerId', user.userId)
    .maybeSingle();

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
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('ProviderKyc')
      .update({
        documentType,
        documentNumber,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        verificationStatus: 'PENDING',
        verifiedBy: null,
        verifiedAt: null,
        rejectionReason: null,
        updatedAt: now,
      })
      .eq('id', kycData.id);

    if (updateError) {
      console.error('KYC resubmit error:', updateError);
      return error('Failed to resubmit KYC documents', 500);
    }

    return json({ message: 'KYC documents resubmitted successfully', kycStatus: 'PENDING' });
  }

  // Create new KYC record
  const kycId = crypto.randomUUID();
  const now = new Date().toISOString();
  const { error: insertError } = await supabase
    .from('ProviderKyc')
    .insert({
      id: kycId,
      providerId: user.userId,
      documentType,
      documentNumber,
      documentFrontUrl,
      documentBackUrl,
      selfieUrl,
      verificationStatus: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });

  if (insertError) {
    console.error('KYC submit error:', insertError);
    return error('Failed to submit KYC documents', 500);
  }

  // Notify admins about new KYC submission
  // Find admin users (roleId = 3 for ADMIN based on Role table)
  const { data: admins } = await supabase
    .from('User')
    .select('id')
    .eq('roleId', 3)
    .limit(1);

  if (admins && admins.length > 0) {
    const adminId = (admins[0] as { id: string }).id;
    await supabase
      .from('Notification')
      .insert({
        id: crypto.randomUUID(),
        userId: adminId,
        type: 'KYC_SUBMISSION',
        title: 'New KYC Submission',
        message: 'A provider has submitted KYC documents for verification',
        actionUrl: '/admin/users',
        isRead: false,
        createdAt: now,
      });
  }

  return json({ message: 'KYC documents submitted successfully', kycStatus: 'PENDING' }, 201);
}
