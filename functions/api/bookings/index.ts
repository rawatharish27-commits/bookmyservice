import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let sql = `
      SELECT b.*, s.title as serviceTitle, s.basePrice as serviceBasePrice, s.images as serviceImages,
             sc.name as categoryName, sc.icon as categoryIcon,
             cu.name as clientName, cu.profileImageUrl as clientImage, cu.phone as clientPhone,
             pu.name as providerName, pu.profileImageUrl as providerImage, pu.phone as providerPhone
      FROM Booking b
      JOIN Service s ON b.serviceId = s.id
      JOIN ServiceCategory sc ON s.categoryId = sc.id
      JOIN User cu ON b.clientId = cu.id
      JOIN User pu ON b.providerId = pu.id
    `;
    const params: any[] = [];

    const conditions: string[] = [];

    // Filter based on role
    if (auth.role === 'CLIENT') {
      conditions.push('b.clientId = ?');
      params.push(auth.userId);
    } else if (auth.role === 'PROVIDER') {
      conditions.push('b.providerId = ?');
      params.push(auth.userId);
    }
    // Admin sees all

    if (status) {
      conditions.push('b.status = ?');
      params.push(status.toUpperCase());
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ` ORDER BY b.createdAt DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const bookings = await query(context.env.DB, sql, params);

    const formatted = bookings.map((b: any) => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      status: b.status,
      scheduledDate: b.scheduledDate,
      scheduledTime: b.scheduledTime,
      serviceAddress: b.serviceAddress,
      basePrice: b.basePrice,
      negotiatedPrice: b.negotiatedPrice,
      finalPrice: b.finalPrice,
      platformFee: b.platformFee,
      providerEarnings: b.providerEarnings,
      specialInstructions: b.specialInstructions,
      cancellationReason: b.cancellationReason,
      cancelledBy: b.cancelledBy,
      cancelledAt: b.cancelledAt,
      completedAt: b.completedAt,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
      service: {
        id: b.serviceId,
        title: b.serviceTitle,
        basePrice: b.serviceBasePrice,
        images: b.serviceImages ? JSON.parse(b.serviceImages) : [],
        category: {
          name: b.categoryName,
          icon: b.categoryIcon,
        },
      },
      client: {
        id: b.clientId,
        name: b.clientName,
        profileImageUrl: b.clientImage,
        phone: b.clientPhone,
      },
      provider: {
        id: b.providerId,
        name: b.providerName,
        profileImageUrl: b.providerImage,
        phone: b.providerPhone,
      },
    }));

    return json({ bookings: formatted });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'CLIENT') return error('Only clients can create bookings', 403);

    const body = await context.request.json() as Record<string, any>;
    const {
      serviceId, scheduledDate, scheduledTime, serviceAddress,
      serviceLatitude, serviceLongitude, specialInstructions,
    } = body;

    if (!serviceId || !scheduledDate || !scheduledTime || !serviceAddress) {
      return error('serviceId, scheduledDate, scheduledTime, and serviceAddress are required', 400);
    }

    // Get service details
    const service = await queryOne(context.env.DB,
      'SELECT id, providerId, basePrice, priceNegotiable FROM Service WHERE id = ? AND isActive = 1 AND isApproved = 1',
      [serviceId]
    );
    if (!service) return error('Service not found or not available', 404);

    const bookingNumber = `BY${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const id = crypto.randomUUID();
    const platformFee = 5.0;

    await execute(context.env.DB, `
      INSERT INTO Booking (id, bookingNumber, clientId, providerId, serviceId, status,
        scheduledDate, scheduledTime, serviceAddress, serviceLatitude, serviceLongitude,
        basePrice, finalPrice, platformFee, specialInstructions, paymentStatus, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', datetime("now"), datetime("now"))
    `, [
      id, bookingNumber, auth.userId, service.providerId, serviceId,
      scheduledDate, scheduledTime, serviceAddress,
      serviceLatitude || null, serviceLongitude || null,
      service.basePrice, service.basePrice, platformFee,
      specialInstructions || null,
    ]);

    // Update service total bookings
    await execute(context.env.DB,
      'UPDATE Service SET totalBookings = totalBookings + 1, updatedAt = datetime("now") WHERE id = ?',
      [serviceId]
    );

    return json({
      booking: { id, bookingNumber, status: 'PENDING', scheduledDate, scheduledTime, finalPrice: service.basePrice },
    }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
