import { queryOne, query, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params;

    const service = await queryOne(context.env.DB, `
      SELECT s.*, sc.name as categoryName, sc.slug as categorySlug, sc.icon as categoryIcon, sc.id as categoryId,
             ss.name as subcategoryName, ss.slug as subcategorySlug, ss.id as subcategoryId,
             u.name as providerName, u.id as providerId, u.profileImageUrl as providerImage,
             u.city as providerCity, u.phone as providerPhone, u.email as providerEmail
      FROM Service s
      JOIN ServiceCategory sc ON s.categoryId = sc.id
      LEFT JOIN ServiceSubcategory ss ON s.subcategoryId = ss.id
      JOIN User u ON s.providerId = u.id
      WHERE s.id = ?
    `, [id]);

    if (!service) return error('Service not found', 404);

    // Get availability
    const availability = await query(context.env.DB,
      'SELECT * FROM ServiceAvailability WHERE serviceId = ? ORDER BY dayOfWeek', [id]
    );

    // Get reviews
    const reviews = await query(context.env.DB, `
      SELECT r.*, u.name as reviewerName, u.profileImageUrl as reviewerImage
      FROM Review r
      JOIN User u ON r.reviewerId = u.id
      WHERE r.serviceId = ?
      ORDER BY r.createdAt DESC
      LIMIT 20
    `, [id]);

    const formattedService = {
      id: service.id,
      title: service.title,
      description: service.description,
      basePrice: service.basePrice,
      priceNegotiable: service.priceNegotiable,
      serviceDurationMinutes: service.serviceDurationMinutes,
      serviceAreaRadiusKm: service.serviceAreaRadiusKm,
      address: service.address,
      city: service.city || service.providerCity,
      state: service.state,
      country: service.country,
      pincode: service.pincode,
      latitude: service.latitude,
      longitude: service.longitude,
      images: service.images ? JSON.parse(service.images) : [],
      averageRating: service.averageRating,
      totalBookings: service.totalBookings,
      totalReviews: service.totalReviews,
      isActive: service.isActive,
      isApproved: service.isApproved,
      approvalStatus: service.approvalStatus,
      category: {
        id: service.categoryId,
        name: service.categoryName,
        slug: service.categorySlug,
        icon: service.categoryIcon,
      },
      subcategory: service.subcategoryName ? {
        id: service.subcategoryId,
        name: service.subcategoryName,
        slug: service.subcategorySlug,
      } : null,
      provider: {
        id: service.providerId,
        name: service.providerName,
        profileImageUrl: service.providerImage,
        city: service.providerCity,
        phone: service.providerPhone,
        email: service.providerEmail,
      },
      availability: availability.map((a: any) => ({
        id: a.id,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isAvailable: a.isAvailable,
        maxBookingsPerSlot: a.maxBookingsPerSlot,
      })),
      reviews: reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        images: r.images ? JSON.parse(r.images) : [],
        isVerified: r.isVerified,
        createdAt: r.createdAt,
        reviewer: {
          id: r.reviewerId,
          name: r.reviewerName,
          profileImageUrl: r.reviewerImage,
        },
      })),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };

    return json({ service: formattedService });
  } catch (e) {
    return error('Internal server error', 500);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { id } = context.params;
    const body = await context.request.json() as Record<string, any>;

    // Verify ownership or admin
    const service = await queryOne(context.env.DB, 'SELECT providerId FROM Service WHERE id = ?', [id]);
    if (!service) return error('Service not found', 404);

    if (auth.role !== 'ADMIN' && service.providerId !== auth.userId) {
      return error('Not authorized to update this service', 403);
    }

    const allowedFields = [
      'title', 'description', 'basePrice', 'priceNegotiable', 'serviceDurationMinutes',
      'serviceAreaRadiusKm', 'address', 'city', 'state', 'country', 'pincode',
      'latitude', 'longitude', 'images', 'isActive',
    ];
    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'images') {
          updates.push(`${field} = ?`);
          values.push(JSON.stringify(body[field]));
        } else if (field === 'priceNegotiable' || field === 'isActive') {
          updates.push(`${field} = ?`);
          values.push(body[field] ? 1 : 0);
        } else {
          updates.push(`${field} = ?`);
          values.push(body[field]);
        }
      }
    }

    if (updates.length === 0) return error('No valid fields to update', 400);

    updates.push('updatedAt = datetime("now")');
    values.push(id);

    await execute(context.env.DB, `UPDATE Service SET ${updates.join(', ')} WHERE id = ?`, values);

    return json({ message: 'Service updated successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { id } = context.params;

    const service = await queryOne(context.env.DB, 'SELECT providerId FROM Service WHERE id = ?', [id]);
    if (!service) return error('Service not found', 404);

    if (auth.role !== 'ADMIN' && service.providerId !== auth.userId) {
      return error('Not authorized to delete this service', 403);
    }

    await execute(context.env.DB, 'DELETE FROM Service WHERE id = ?', [id]);
    return json({ message: 'Service deleted successfully' });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
