/**
 * GET /api/admin/users/:userId - Get user details
 * PATCH /api/admin/users/:userId - Update user status (ACTIVE, SUSPENDED, BANNED)
 * Requires ADMIN role
 */

import { createSupabaseClient, Env, DbRecord } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';
import { sanitizeString, getClientIP } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: Env;
  params: { userId: string };
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const { userId } = context.params;

  const supabase = createSupabaseClient(context.env);

  // Fetch user with role
  const { data: userDetails } = await supabase
    .from('User')
    .select('id, email, phone, name, status, emailVerified, phoneVerified, profileImageUrl, address, city, state, country, pincode, latitude, longitude, createdAt, updatedAt, lastLoginAt, roleId')
    .eq('id', userId)
    .maybeSingle();

  if (!userDetails) {
    return notFound('User not found');
  }

  // Fetch role info
  const { data: roleData } = await supabase
    .from('Role')
    .select('id, name')
    .eq('id', (userDetails as Record<string, unknown>).roleId)
    .maybeSingle();

  const userWithRole = {
    ...userDetails,
    role: roleData ? (roleData as Record<string, unknown>).name : null,
  };

  // If provider, get KYC info
  let kycInfo: DbRecord | null = null;
  if ((roleData as Record<string, unknown>)?.name === 'PROVIDER') {
    const { data: kyc } = await supabase
      .from('ProviderKyc')
      .select('id, documentType, verificationStatus, rejectionReason, createdAt, verifiedAt')
      .eq('providerId', userId)
      .maybeSingle();
    kycInfo = kyc;
  }

  // Get booking stats
  const { count: clientBookings } = await supabase
    .from('Booking')
    .select('id', { count: 'exact' })
    .eq('clientId', userId);

  const { count: providerBookings } = await supabase
    .from('Booking')
    .select('id', { count: 'exact' })
    .eq('providerId', userId);

  // Get review stats
  const { count: reviewsGiven } = await supabase
    .from('Review')
    .select('id', { count: 'exact' })
    .eq('reviewerId', userId);

  const { data: reviewsReceivedData } = await supabase
    .from('Review')
    .select('rating')
    .eq('reviewedId', userId);

  const reviewsReceivedCount = reviewsReceivedData?.length ?? 0;
  const avgRating = reviewsReceivedData && reviewsReceivedData.length > 0
    ? reviewsReceivedData.reduce((sum, r) => sum + Number(r.rating), 0) / reviewsReceivedData.length
    : 0;

  return json({
    user: userWithRole,
    kyc: kycInfo,
    stats: {
      clientBookings: clientBookings ?? 0,
      providerBookings: providerBookings ?? 0,
      reviewsGiven: reviewsGiven ?? 0,
      reviewsReceived: {
        count: reviewsReceivedCount,
        avgRating,
      },
    },
  });
}

export async function onRequestPatch(context: EventContext): Promise<Response> {
  let user;
  try {
    user = await requireAuth(context.request, context.env);
  } catch {
    return unauthorized();
  }

  if (!requireRole(user, 'ADMIN')) {
    return forbidden('Admin access required');
  }

  const { userId } = context.params;

  const supabase = createSupabaseClient(context.env);

  // Check user exists
  const { data: existingUser } = await supabase
    .from('User')
    .select('id, status, name')
    .eq('id', userId)
    .maybeSingle();

  if (!existingUser) {
    return notFound('User not found');
  }

  let body;
  try {
    body = await context.request.json() as { status?: string };
  } catch {
    return error('Invalid request body');
  }

  const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING'];
  if (!body.status || !validStatuses.includes(body.status)) {
    return error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const newStatus = sanitizeString(body.status);
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('User')
    .update({
      status: newStatus,
      updatedAt: now,
    })
    .eq('id', userId);

  if (updateError) {
    return error('Failed to update user status: ' + updateError.message);
  }

  // Log admin action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await supabase.from('AdminLog').insert({
    id: crypto.randomUUID(),
    adminId: user.userId,
    action: 'UPDATE_USER_STATUS',
    targetType: 'USER',
    targetId: userId,
    details: JSON.stringify({ previousStatus: (existingUser as Record<string, unknown>).status, newStatus }),
    ipAddress: ip,
    userAgent,
    createdAt: now,
  });

  // Fetch updated user with role
  const { data: updatedUser } = await supabase
    .from('User')
    .select('id, email, name, status, roleId')
    .eq('id', userId)
    .maybeSingle();

  let userWithRole = updatedUser;
  if (updatedUser) {
    const { data: roleData } = await supabase
      .from('Role')
      .select('id, name')
      .eq('id', (updatedUser as Record<string, unknown>).roleId)
      .maybeSingle();
    userWithRole = {
      ...updatedUser,
      role: roleData ? (roleData as Record<string, unknown>).name : null,
    };
  }

  return json({ user: userWithRole, message: 'User status updated successfully' });
}
