import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const url = new URL(context.request.url);
    const serviceId = url.searchParams.get('serviceId');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let sql = `
      SELECT r.*, s.title as serviceTitle,
             ru.name as reviewerName, ru.profileImageUrl as reviewerImage,
             du.name as reviewedName
      FROM Review r
      JOIN Service s ON r.serviceId = s.id
      JOIN User ru ON r.reviewerId = ru.id
      JOIN User du ON r.reviewedId = du.id
    `;
    const params: any[] = [];

    const conditions: string[] = [];

    // Filter by role
    if (auth.role === 'CLIENT') {
      conditions.push('r.reviewerId = ?');
      params.push(auth.userId);
    } else if (auth.role === 'PROVIDER') {
      conditions.push('r.reviewedId = ?');
      params.push(auth.userId);
    }

    if (serviceId) {
      conditions.push('r.serviceId = ?');
      params.push(serviceId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY r.createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const reviews = await query(context.env.DB, sql, params);

    const formatted = reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      images: r.images ? JSON.parse(r.images) : [],
      isVerified: r.isVerified,
      createdAt: r.createdAt,
      service: { id: r.serviceId, title: r.serviceTitle },
      reviewer: { id: r.reviewerId, name: r.reviewerName, profileImageUrl: r.reviewerImage },
      reviewed: { id: r.reviewedId, name: r.reviewedName },
    }));

    return json({ reviews: formatted });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'CLIENT') return error('Only clients can submit reviews', 403);

    const body = await context.request.json() as {
      bookingId: string; serviceId: string; providerId: string;
      rating: number; comment?: string; images?: string[];
    };

    if (!body.bookingId || !body.serviceId || !body.providerId || !body.rating) {
      return error('bookingId, serviceId, providerId, and rating are required', 400);
    }

    if (body.rating < 1 || body.rating > 5) return error('Rating must be between 1 and 5', 400);

    // Check if already reviewed
    const existing = await queryOne(context.env.DB,
      'SELECT id FROM Review WHERE bookingId = ?', [body.bookingId]
    );
    if (existing) return error('Review already exists for this booking', 409);

    // Verify booking belongs to user and is completed
    const booking = await queryOne(context.env.DB,
      'SELECT status, clientId, providerId, serviceId FROM Booking WHERE id = ?', [body.bookingId]
    );
    if (!booking) return error('Booking not found', 404);
    if (booking.clientId !== auth.userId) return error('Not your booking', 403);
    if (booking.status !== 'COMPLETED') return error('Can only review completed bookings', 400);

    const id = crypto.randomUUID();
    await execute(context.env.DB, `
      INSERT INTO Review (id, bookingId, reviewerId, reviewedId, serviceId, rating, comment, images, isVerified, isFlagged, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, datetime("now"), datetime("now"))
    `, [
      id, body.bookingId, auth.userId, body.providerId || booking.providerId,
      body.serviceId || booking.serviceId, body.rating,
      body.comment || null, body.images ? JSON.stringify(body.images) : null,
    ]);

    // Update service average rating
    await execute(context.env.DB, `
      UPDATE Service SET
        totalReviews = totalReviews + 1,
        averageRating = (SELECT AVG(rating) FROM Review WHERE serviceId = ?),
        updatedAt = datetime("now")
      WHERE id = ?
    `, [body.serviceId || booking.serviceId, body.serviceId || booking.serviceId]);

    return json({ review: { id, rating: body.rating, comment: body.comment } }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
