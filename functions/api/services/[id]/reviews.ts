import { query } from '../../../_shared/db';
import { json, error } from '../../../_shared/response';
import { Env } from '../../../types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { id } = context.params;
    const url = new URL(context.request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const reviews = await query(context.env.DB, `
      SELECT r.id, r.rating, r.comment, r.images, r.isVerified, r.createdAt,
             u.id as reviewerId, u.name as reviewerName, u.profileImageUrl as reviewerImage
      FROM Review r
      JOIN User u ON r.reviewerId = u.id
      WHERE r.serviceId = ?
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `, [id, limit, offset]);

    const formatted = reviews.map((r: any) => ({
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
    }));

    return json({ reviews: formatted });
  } catch (e) {
    return error('Internal server error', 500);
  }
};
