import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where: any = {
      isActive: true,
      isApproved: true,
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [services, total] = await Promise.all([
      db.service.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              profileImageUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      db.service.count({ where }),
    ]);

    return NextResponse.json({
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        basePrice: s.basePrice,
        priceNegotiable: s.priceNegotiable,
        averageRating: s.averageRating,
        totalBookings: s.totalBookings,
        totalReviews: s.totalReviews,
        city: s.city,
        images: s.images,
        provider: s.provider,
        category: s.category,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { services: [], pagination: { total: 0, limit: 10, offset: 0, hasMore: false }, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
