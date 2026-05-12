/**
 * GET /api/services/:id
 * Returns single service with full details, provider info, and reviews.
 */

import { queryOne, query } from '../../_shared/db';
import { json, notFound, serverError } from '../../_shared/response';

export async function onRequestGet(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { env, params } = context as { env: { DB: D1Database }; params: { id: string } };

  try {
    const serviceId = String(params.id);

    if (!serviceId) {
      return json({ error: 'Invalid service ID' }, 400);
    }

    // ─── Fetch service with provider and category info ───────────
    const service = await queryOne(
      env.DB,
      `SELECT s.id, s.title, s.description, s.basePrice, s.priceNegotiable,
              s.averageRating, s.totalBookings, s.totalReviews, s.city, s.state, s.country,
              s.address, s.pincode, s.images, s.serviceDurationMinutes, s.serviceAreaRadiusKm,
              s.isActive, s.approvalStatus, s.createdAt, s.updatedAt,
              u.id as providerId, u.name as providerName, u.email as providerEmail,
              u.phone as providerPhone, u.profileImageUrl as providerImage, u.city as providerCity,
              kyc.verificationStatus as providerKycStatus,
              sc.id as categoryId, sc.name as categoryName, sc.slug as categorySlug, sc.icon as categoryIcon,
              ss.id as subcategoryId, ss.name as subcategoryName, ss.slug as subcategorySlug
       FROM Service s
       JOIN User u ON s.providerId = u.id
       LEFT JOIN ProviderKyc kyc ON kyc.providerId = u.id
       JOIN ServiceCategory sc ON s.categoryId = sc.id
       LEFT JOIN ServiceSubcategory ss ON s.subcategoryId = ss.id
       WHERE s.id = ?`,
      [serviceId]
    );

    if (!service) {
      return notFound('Service not found');
    }

    // ─── Fetch availability slots ────────────────────────────────
    const availability = await query(
      env.DB,
      `SELECT id, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot
       FROM ServiceAvailability
       WHERE serviceId = ?
       ORDER BY dayOfWeek, startTime`,
      [serviceId]
    );

    // ─── Fetch reviews for this service ──────────────────────────
    const reviews = await query(
      env.DB,
      `SELECT r.id, r.rating, r.comment, r.isVerified, r.createdAt,
              u.id as reviewerId, u.name as reviewerName, u.profileImageUrl as reviewerImage
       FROM Review r
       JOIN User u ON r.reviewerId = u.id
       WHERE r.serviceId = ?
       ORDER BY r.createdAt DESC
       LIMIT 50`,
      [serviceId]
    );

    // ─── Build structured response ───────────────────────────────
    const s = service as Record<string, unknown>;

    const formattedService = {
      id: s.id,
      title: s.title,
      description: s.description,
      basePrice: s.basePrice,
      priceNegotiable: s.priceNegotiable,
      averageRating: s.averageRating,
      totalBookings: s.totalBookings,
      totalReviews: s.totalReviews,
      city: s.city,
      state: s.state,
      country: s.country,
      address: s.address,
      pincode: s.pincode,
      images: s.images,
      serviceDurationMinutes: s.serviceDurationMinutes,
      serviceAreaRadiusKm: s.serviceAreaRadiusKm,
      isActive: s.isActive,
      approvalStatus: s.approvalStatus,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      provider: {
        id: s.providerId,
        name: s.providerName,
        email: s.providerEmail,
        phone: s.providerPhone,
        profileImageUrl: s.providerImage,
        city: s.providerCity,
        kycStatus: s.providerKycStatus,
      },
      category: {
        id: s.categoryId,
        name: s.categoryName,
        slug: s.categorySlug,
        icon: s.categoryIcon,
      },
      subcategory: s.subcategoryId ? {
        id: s.subcategoryId,
        name: s.subcategoryName,
        slug: s.subcategorySlug,
      } : null,
      availability: (availability as Record<string, unknown>[]).map((a) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isAvailable: a.isAvailable,
        maxBookingsPerSlot: a.maxBookingsPerSlot,
      })),
      reviews: (reviews as Record<string, unknown>[]).map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVerified: r.isVerified,
        createdAt: r.createdAt,
        reviewer: {
          id: r.reviewerId,
          name: r.reviewerName,
          profileImageUrl: r.reviewerImage,
        },
      })),
    };

    return json({ service: formattedService });
  } catch (err) {
    console.error('Get service error:', err);
    return serverError('Failed to fetch service');
  }
}
