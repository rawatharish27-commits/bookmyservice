/**
 * GET /api/admin/users/:userId - Get user details
 * PATCH /api/admin/users/:userId - Update user status (ACTIVE, SUSPENDED, BANNED)
 * Requires ADMIN role
 */

import { queryOne, execute, query } from '../../../_shared/db';
import { requireAuth, requireRole } from '../../../_shared/auth';
import { json, unauthorized, forbidden, notFound, error } from '../../../_shared/response';
import { sanitizeString, getClientIP } from '../../../_shared/security';

interface EventContext {
  request: Request;
  env: { DB: D1Database; JWT_SECRET?: string };
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

  const userDetails = await queryOne(
    context.env.DB,
    `SELECT u.id, u.email, u.phone, u.name, u.status, u.emailVerified, u.phoneVerified,
            u.profileImageUrl, u.address, u.city, u.state, u.country, u.pincode,
            u.latitude, u.longitude, u.createdAt, u.updatedAt, u.lastLoginAt,
            r.name as role, r.id as roleId
     FROM User u
     JOIN Role r ON u.roleId = r.id
     WHERE u.id = ?`,
    [userId]
  );

  if (!userDetails) {
    return notFound('User not found');
  }

  // If provider, get KYC info
  let kycInfo = null;
  if ((userDetails as { role: string }).role === 'PROVIDER') {
    kycInfo = await queryOne(
      context.env.DB,
      `SELECT id, documentType, verificationStatus, rejectionReason, createdAt, verifiedAt
       FROM ProviderKyc WHERE providerId = ?`,
      [userId]
    );
  }

  // Get booking stats
  const clientBookings = await queryOne(
    context.env.DB,
    'SELECT COUNT(*) as count FROM Booking WHERE clientId = ?',
    [userId]
  );

  const providerBookings = await queryOne(
    context.env.DB,
    'SELECT COUNT(*) as count FROM Booking WHERE providerId = ?',
    [userId]
  );

  // Get review stats
  const reviewsGiven = await queryOne(
    context.env.DB,
    'SELECT COUNT(*) as count FROM Review WHERE reviewerId = ?',
    [userId]
  );

  const reviewsReceived = await queryOne(
    context.env.DB,
    'SELECT COUNT(*) as count, COALESCE(AVG(rating), 0) as avgRating FROM Review WHERE reviewedId = ?',
    [userId]
  );

  return json({
    user: userDetails,
    kyc: kycInfo,
    stats: {
      clientBookings: (clientBookings as { count: number } | null)?.count ?? 0,
      providerBookings: (providerBookings as { count: number } | null)?.count ?? 0,
      reviewsGiven: (reviewsGiven as { count: number } | null)?.count ?? 0,
      reviewsReceived: {
        count: (reviewsReceived as { count: number } | null)?.count ?? 0,
        avgRating: (reviewsReceived as { avgRating: number } | null)?.avgRating ?? 0,
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

  // Check user exists
  const existingUser = await queryOne(
    context.env.DB,
    'SELECT id, status, name FROM User WHERE id = ?',
    [userId]
  );

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

  await execute(
    context.env.DB,
    'UPDATE User SET status = ?, updatedAt = datetime(\'now\') WHERE id = ?',
    [newStatus, userId]
  );

  // Log admin action
  const ip = getClientIP(context.request);
  const userAgent = context.request.headers.get('User-Agent') || null;
  await execute(
    context.env.DB,
    `INSERT INTO AdminLog (id, adminId, action, targetType, targetId, details, ipAddress, userAgent, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [
      crypto.randomUUID(),
      user.userId,
      'UPDATE_USER_STATUS',
      'USER',
      userId,
      JSON.stringify({ previousStatus: (existingUser as { status: string }).status, newStatus }),
      ip,
      userAgent,
    ]
  );

  const updatedUser = await queryOne(
    context.env.DB,
    `SELECT u.id, u.email, u.name, u.status, r.name as role
     FROM User u JOIN Role r ON u.roleId = r.id WHERE u.id = ?`,
    [userId]
  );

  return json({ user: updatedUser, message: 'User status updated successfully' });
}
