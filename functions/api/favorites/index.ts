import { query, queryOne, execute } from '../../_shared/db';
import { requireAuth } from '../../_shared/auth';
import { json, error } from '../../_shared/response';
import { Env } from '../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);

    const favorites = await query(context.env.DB, `
      SELECT f.id, f.createdAt, s.id as serviceId, s.title, s.description, s.basePrice, s.images,
             s.averageRating, s.totalBookings, s.totalReviews, s.city,
             sc.name as categoryName, sc.icon as categoryIcon,
             u.name as providerName, u.profileImageUrl as providerImage, u.city as providerCity
      FROM Favorite f
      JOIN Service s ON f.serviceId = s.id
      JOIN ServiceCategory sc ON s.categoryId = sc.id
      JOIN User u ON s.providerId = u.id
      WHERE f.userId = ?
      ORDER BY f.createdAt DESC
    `, [auth.userId]);

    const formatted = favorites.map((f: any) => ({
      id: f.id,
      createdAt: f.createdAt,
      service: {
        id: f.serviceId,
        title: f.title,
        description: f.description,
        basePrice: f.basePrice,
        images: f.images ? JSON.parse(f.images) : [],
        averageRating: f.averageRating,
        totalBookings: f.totalBookings,
        totalReviews: f.totalReviews,
        city: f.city || f.providerCity,
        category: { name: f.categoryName, icon: f.categoryIcon },
        provider: { name: f.providerName, profileImageUrl: f.providerImage, city: f.providerCity },
      },
    }));

    return json({ favorites: formatted });
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const auth = await requireAuth(context.request, context.env.JWT_SECRET);
    const { serviceId } = await context.request.json() as { serviceId: string };

    if (!serviceId) return error('serviceId is required', 400);

    // Check if already favorited
    const existing = await queryOne(context.env.DB,
      'SELECT id FROM Favorite WHERE userId = ? AND serviceId = ?', [auth.userId, serviceId]
    );
    if (existing) return error('Already favorited', 409);

    const id = crypto.randomUUID();
    await execute(context.env.DB,
      'INSERT INTO Favorite (id, userId, serviceId, createdAt) VALUES (?, ?, ?, datetime("now"))',
      [id, auth.userId, serviceId]
    );

    return json({ favorite: { id, serviceId } }, 201);
  } catch (e) {
    if (e instanceof Error && e.message === 'UNAUTHORIZED') return error('Unauthorized', 401);
    return error('Internal server error', 500);
  }
};
