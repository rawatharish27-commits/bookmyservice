import { queryOne, query, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { id } = context.params;

    const booking = await queryOne(context.env.DB, `
      SELECT b.*,
             s.title as serviceTitle, s.description as serviceDescription, s.basePrice as serviceBasePrice,
             s.images as serviceImages, s.serviceDurationMinutes,
             sc.name as categoryName, sc.icon as categoryIcon,
             cu.name as clientName, cu.email as clientEmail, cu.phone as clientPhone, cu.profileImageUrl as clientImage,
             pu.name as providerName, pu.email as providerEmail, pu.phone as providerPhone, pu.profileImageUrl as providerImage,
             p.status as paymentStatus, p.paymentMethod, p.gateway
      FROM Booking b
      JOIN Service s ON b.serviceId = s.id
      JOIN ServiceCategory sc ON s.categoryId = sc.id
      JOIN User cu ON b.clientId = cu.id
      JOIN User pu ON b.providerId = pu.id
      LEFT JOIN Payment p ON b.id = p.bookingId
      WHERE b.id = ?
    `, [id]);

    if (!booking) return error('Booking not found', 404);

    // Check access
    if (auth.role === 'CLIENT' && booking.clientId !== auth.userId) {
      return error('Unauthorized', 401);
    }
    if (auth.role === 'PROVIDER' && booking.providerId !== auth.userId) {
      return error('Unauthorized', 401);
    }

    // Get review if exists
    const review = await queryOne(context.env.DB,
      'SELECT id, rating, comment, createdAt FROM Review WHERE bookingId = ?', [id]
    );

    const formatted = {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      status: booking.status,
      scheduledDate: booking.scheduledDate,
      scheduledTime: booking.scheduledTime,
      serviceAddress: booking.serviceAddress,
      serviceLatitude: booking.serviceLatitude,
      serviceLongitude: booking.serviceLongitude,
      basePrice: booking.basePrice,
      negotiatedPrice: booking.negotiatedPrice,
      finalPrice: booking.finalPrice,
      platformFee: booking.platformFee,
      providerEarnings: booking.providerEarnings,
      specialInstructions: booking.specialInstructions,
      cancellationReason: booking.cancellationReason,
      cancelledBy: booking.cancelledBy,
      cancelledAt: booking.cancelledAt,
      completedAt: booking.completedAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      service: {
        id: booking.serviceId,
        title: booking.serviceTitle,
        description: booking.serviceDescription,
        basePrice: booking.serviceBasePrice,
        images: booking.serviceImages ? JSON.parse(booking.serviceImages) : [],
        serviceDurationMinutes: booking.serviceDurationMinutes,
        category: {
          name: booking.categoryName,
          icon: booking.categoryIcon,
        },
      },
      client: {
        id: booking.clientId,
        name: booking.clientName,
        email: booking.clientEmail,
        phone: booking.clientPhone,
        profileImageUrl: booking.clientImage,
      },
      provider: {
        id: booking.providerId,
        name: booking.providerName,
        email: booking.providerEmail,
        phone: booking.providerPhone,
        profileImageUrl: booking.providerImage,
      },
      payment: booking.paymentStatus ? {
        status: booking.paymentStatus,
        method: booking.paymentMethod,
        gateway: booking.gateway,
      } : null,
      review: review ? {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      } : null,
    };

    return json({ booking: formatted });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
