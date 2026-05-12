/**
 * GET /api/bookings - Returns user's bookings
 *   - Client sees own bookings
 *   - Provider sees assigned bookings
 *   - Admin sees all bookings
 *
 * POST /api/bookings - Create a new booking
 *   - Client only (requireRole CLIENT)
 */

import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth, requireRole } from '../../_shared/auth';
import { json, error, unauthorized, forbidden } from '../../_shared/response';
import { sanitizeString, sanitizeObject, validatePrice } from '../../_shared/security';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
}

// Generate a unique booking number
function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BYS-${timestamp}-${random}`;
}

// Generate a unique ID
function generateId(): string {
  return `bkg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestGet(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    let bookings;
    let countResult;

    if (user.role === 'ADMIN') {
      // Admin sees all bookings
      const whereClause = status ? ' WHERE b.status = ?' : '';
      const params = status ? [status] : [];

      countResult = await queryOne(
        context.env.DB,
        `SELECT COUNT(*) as total FROM Booking${whereClause}`,
        params
      );

      bookings = await query(
        context.env.DB,
        `SELECT b.*, s.title as serviceTitle, s.basePrice as serviceBasePrice,
                c.name as clientName, c.email as clientEmail, c.phone as clientPhone,
                p.name as providerName, p.email as providerEmail, p.phone as providerPhone
         FROM Booking b
         LEFT JOIN Service s ON b.serviceId = s.id
         LEFT JOIN User c ON b.clientId = c.id
         LEFT JOIN User p ON b.providerId = p.id
         ${whereClause}
         ORDER BY b.createdAt DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
    } else if (user.role === 'PROVIDER') {
      // Provider sees assigned bookings
      const whereClause = status ? ' WHERE b.providerId = ? AND b.status = ?' : ' WHERE b.providerId = ?';
      const params = status ? [user.userId, status] : [user.userId];

      countResult = await queryOne(
        context.env.DB,
        `SELECT COUNT(*) as total FROM Booking b${whereClause}`,
        params
      );

      bookings = await query(
        context.env.DB,
        `SELECT b.*, s.title as serviceTitle, s.basePrice as serviceBasePrice,
                c.name as clientName, c.email as clientEmail, c.phone as clientPhone
         FROM Booking b
         LEFT JOIN Service s ON b.serviceId = s.id
         LEFT JOIN User c ON b.clientId = c.id
         ${whereClause}
         ORDER BY b.createdAt DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
    } else {
      // Client sees own bookings
      const whereClause = status ? ' WHERE b.clientId = ? AND b.status = ?' : ' WHERE b.clientId = ?';
      const params = status ? [user.userId, status] : [user.userId];

      countResult = await queryOne(
        context.env.DB,
        `SELECT COUNT(*) as total FROM Booking b${whereClause}`,
        params
      );

      bookings = await query(
        context.env.DB,
        `SELECT b.*, s.title as serviceTitle, s.basePrice as serviceBasePrice,
                p.name as providerName, p.email as providerEmail, p.phone as providerPhone
         FROM Booking b
         LEFT JOIN Service s ON b.serviceId = s.id
         LEFT JOIN User p ON b.providerId = p.id
         ${whereClause}
         ORDER BY b.createdAt DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
    }

    const total = (countResult as Record<string, unknown>)?.total || 0;

    return json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(Number(total) / limit),
      },
    });
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Get bookings error:', err);
    return error('Failed to fetch bookings', 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const user = await requireAuth(context.request, context.env);
    if (!user) return unauthorized();

    // Client only
    if (!requireRole(user, 'CLIENT')) {
      return forbidden('Only clients can create bookings');
    }

    const body = await context.request.json() as Record<string, unknown>;
    const sanitized = sanitizeObject(body);

    const serviceId = sanitized.serviceId as string;
    const scheduledDate = sanitized.scheduledDate as string;
    const scheduledTime = sanitized.scheduledTime as string;
    const address = sanitizeString(String(sanitized.address || ''));
    const city = sanitizeString(String(sanitized.city || ''));
    const pincode = sanitizeString(String(sanitized.pincode || ''));
    const notes = sanitized.notes ? sanitizeString(String(sanitized.notes)) : null;

    // Validate required fields
    if (!serviceId) return error('serviceId is required');
    if (!scheduledDate) return error('scheduledDate is required');
    if (!scheduledTime) return error('scheduledTime is required');
    if (!address) return error('address is required');
    if (!city) return error('city is required');
    if (!pincode) return error('pincode is required');

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
      return error('scheduledDate must be in YYYY-MM-DD format');
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(scheduledTime)) {
      return error('scheduledTime must be in HH:MM format');
    }

    // Validate pincode (6 digits for India)
    if (!/^\d{6}$/.test(pincode)) {
      return error('pincode must be a 6-digit number');
    }

    // Look up the service to get basePrice and providerId
    const service = await queryOne(
      context.env.DB,
      `SELECT id, providerId, basePrice, title, city FROM Service WHERE id = ? AND isActive = 1 AND approvalStatus = 'APPROVED'`,
      [serviceId]
    );

    if (!service) {
      return error('Service not found or not available', 404);
    }

    const serviceData = service as Record<string, unknown>;
    const basePrice = Number(serviceData.basePrice);
    const providerId = String(serviceData.providerId);

    // Validate price
    if (!validatePrice(basePrice)) {
      return error('Service price is outside the allowed range (₹199-₹499)');
    }

    // Prevent client from booking their own service (if they're also a provider)
    if (user.userId === providerId) {
      return error('You cannot book your own service');
    }

    // Check that the scheduled date is not in the past
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime < new Date()) {
      return error('Scheduled date and time cannot be in the past');
    }

    const bookingId = generateId();
    const bookingNumber = generateBookingNumber();
    const serviceAddress = [address, city, pincode].filter(Boolean).join(', ');
    const platformFee = 5.0;
    const finalPrice = basePrice;
    const providerEarnings = basePrice - platformFee;

    await execute(
      context.env.DB,
      `INSERT INTO Booking (id, bookingNumber, clientId, providerId, serviceId, status, scheduledDate, scheduledTime, serviceAddress, basePrice, finalPrice, platformFee, providerEarnings, specialInstructions, paymentStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime('now'), datetime('now'))`,
      [bookingId, bookingNumber, user.userId, providerId, serviceId, scheduledDate, scheduledTime, serviceAddress, basePrice, finalPrice, platformFee, providerEarnings, notes]
    );

    // Create notification for the provider
    const notifId = `notif_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    await execute(
      context.env.DB,
      `INSERT INTO Notification (id, userId, type, title, message, actionUrl, createdAt)
       VALUES (?, ?, 'BOOKING', 'New Booking Request', ?, ?, datetime('now'))`,
      [notifId, providerId, `You have a new booking request for ${String(serviceData.title)}`, `/bookings/${bookingId}`]
    );

    // Fetch the created booking
    const booking = await queryOne(
      context.env.DB,
      `SELECT b.*, s.title as serviceTitle
       FROM Booking b
       LEFT JOIN Service s ON b.serviceId = s.id
       WHERE b.id = ?`,
      [bookingId]
    );

    return json({ booking }, 201);
  } catch (err) {
    if ((err as Error).message === 'UNAUTHORIZED') return unauthorized();
    console.error('Create booking error:', err);
    return error('Failed to create booking', 500);
  }
}
