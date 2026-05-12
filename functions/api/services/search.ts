import { query } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const q = url.searchParams.get('q');
    const category = url.searchParams.get('category');
    const city = url.searchParams.get('city');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const sort = url.searchParams.get('sort') || 'relevance';

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

    if (q) {
      sql += ` AND (s.title LIKE ? OR s.description LIKE ? OR sc.name LIKE ? OR ss.name LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    if (category) {
      sql += ` AND (sc.id = ? OR sc.slug = ? OR sc.name LIKE ?)`;
      const catNum = parseInt(category);
      params.push(isNaN(catNum) ? category : catNum, category, `%${category}%`);
    }

    if (city) {
      sql += ` AND (s.city LIKE ? OR u.city LIKE ?)`;
      params.push(`%${city}%`, `%${city}%`);
    }

    if (minPrice) {
      sql += ` AND s.basePrice >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ` AND s.basePrice <= ?`;
      params.push(parseFloat(maxPrice));
    }

    // Count total
    let countSql = sql.replace(/SELECT s\.\*,.*FROM/, 'SELECT COUNT(*) as total FROM');
    countSql = countSql.split('ORDER BY')[0];
    const countResult = await query(context.env.DB, countSql, params);
    const total = (countResult[0] as any)?.total || 0;

    // Sorting
    switch (sort) {
      case 'price_low':
        sql += ` ORDER BY s.basePrice ASC`;
        break;
      case 'price_high':
        sql += ` ORDER BY s.basePrice DESC`;
        break;
      case 'rating':
        sql += ` ORDER BY s.averageRating DESC`;
        break;
      case 'newest':
        sql += ` ORDER BY s.createdAt DESC`;
        break;
      default:
        sql += ` ORDER BY s.averageRating DESC, s.totalBookings DESC`;
    }

    sql += ` LIMIT ? OFFSET ?`;
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
    }));

    return json({
      services: formattedServices,
      pagination: { total, limit, offset },
    });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
