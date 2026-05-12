import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const favorites = await db.favorite.findMany({
      where: { userId: user.userId },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            basePrice: true,
            images: true,
            city: true,
            averageRating: true,
            totalReviews: true,
            category: { select: { id: true, name: true } },
            provider: { select: { id: true, name: true, profileImageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Favorites fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check if already favorited
    const existing = await db.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId: user.userId,
          serviceId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Service already in favorites' },
        { status: 409 }
      );
    }

    const favorite = await db.favorite.create({
      data: {
        userId: user.userId,
        serviceId,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
