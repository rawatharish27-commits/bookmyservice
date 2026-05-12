import { query, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const city = url.searchParams.get('city');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const providerId = url.searchParams.get('providerId');

    let sql = `
      SELECT s.*, sc.name as categoryName, sc.slug as categorySlug, sc.icon as categoryIcon,
             ss.name as subcategoryName, ss.slug as subcategorySlug,
             u.name as providerName, u.id as providerId, u.profileImageUrl as providerImage, u.city as providerCity
      FROM Service s
      JOIN ServiceCategory sc ON s.categoryId = sc.id
      LEFT JOIN ServiceSubcategory ss ON s.subcategoryId = ss.id
      JOIN User u ON s.providerId = u.id
      WHERE s.isActive = 1 AND s.isApproved = 1
    `;
    const params: any[] = [];

    if (category) {
      sql += ` AND (sc.id = ? OR sc.slug = ?)`;
      const catNum = parseInt(category);
      params.push(isNaN(catNum) ? category : catNum, category);
    }

    if (city) {
      sql += ` AND (s.city LIKE ? OR u.city LIKE ?)`;
      params.push(`%${city}%`, `%${city}%`);
    }

    if (search) {
      sql += ` AND (s.title LIKE ? OR s.description LIKE ? OR sc.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (providerId) {
      sql += ` AND s.providerId = ?`;
      params.push(providerId);
    }

    // Count total
    let countSql = sql.replace(/SELECT s\.\*,.*FROM/, 'SELECT COUNT(*) as total FROM');
    countSql = countSql.split('ORDER BY')[0]; // Remove order by if present
    const countResult = await query(context.env.DB, countSql, params);
    const total = (countResult[0] as any)?.total || 0;

    sql += ` ORDER BY s.averageRating DESC, s.totalBookings DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const services = await query(context.env.DB, sql, params);

    const formattedServices = services.map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      basePrice: s.basePrice,
      priceNegotiable: s.priceNegotiable,
      serviceDurationMinutes: s.serviceDurationMinutes,
      city: s.city || s.providerCity,
      images: s.images ? JSON.parse(s.images) : [],
      averageRating: s.averageRating,
      totalBookings: s.totalBookings,
      totalReviews: s.totalReviews,
      isActive: s.isActive,
      isApproved: s.isApproved,
      approvalStatus: s.approvalStatus,
      category: {
        id: s.categoryId,
        name: s.categoryName,
        slug: s.categorySlug,
        icon: s.categoryIcon,
      },
      subcategory: s.subcategoryName ? {
        id: s.subcategoryId,
        name: s.subcategoryName,
        slug: s.subcategorySlug,
      } : null,
      provider: {
        id: s.providerId,
        name: s.providerName,
        profileImageUrl: s.providerImage,
        city: s.providerCity,
      },
      createdAt: s.createdAt,
    }));

    return json({
      services: formattedServices,
      pagination: { total, limit, offset },
    });
  } catch (e) {
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    if (auth.role !== 'PROVIDER' && auth.role !== 'ADMIN') {
      return error('Only providers can create services', 403);
    }

    const body = await context.request.json() as Record<string, any>;
    const {
      title, description, basePrice, categoryId, subcategoryId,
      priceNegotiable, serviceDurationMinutes, serviceAreaRadiusKm,
      address, city, state, country, pincode, latitude, longitude,
      images, availability,
    } = body;

    if (!title || !description || !basePrice || !categoryId) {
      return error('Title, description, basePrice, and categoryId are required', 400);
    }

    const id = crypto.randomUUID();
    await execute(context.env.DB, `
      INSERT INTO Service (id, providerId, categoryId, subcategoryId, title, description, basePrice,
        priceNegotiable, serviceDurationMinutes, serviceAreaRadiusKm, address, city, state, country, pincode,
        latitude, longitude, images, isActive, isApproved, approvalStatus, averageRating, totalBookings, totalReviews,
        createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'PENDING', 0, 0, 0, datetime("now"), datetime("now"))
    `, [
      id, auth.userId, categoryId, subcategoryId || null, title, description, basePrice,
      priceNegotiable ? 1 : 0, serviceDurationMinutes || null, serviceAreaRadiusKm || 10,
      address || null, city || null, state || null, country || null, pincode || null,
      latitude || null, longitude || null,
      images ? JSON.stringify(images) : null,
    ]);

    // Insert availability if provided
    if (availability && Array.isArray(availability)) {
      for (const slot of availability) {
        const availId = crypto.randomUUID();
        await execute(context.env.DB, `
          INSERT INTO ServiceAvailability (id, serviceId, dayOfWeek, startTime, endTime, isAvailable, maxBookingsPerSlot, createdAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))
        `, [availId, id, slot.dayOfWeek, slot.startTime, slot.endTime, slot.isAvailable !== false ? 1 : 0, slot.maxBookingsPerSlot || 1]);
      }
    }

    return json({
      service: { id, title, description, basePrice, categoryId, approvalStatus: 'PENDING' },
    }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
