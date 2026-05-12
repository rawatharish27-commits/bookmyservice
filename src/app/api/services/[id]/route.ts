import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await db.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            profileImageUrl: true,
            city: true,
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { id: true, name: true, profileImageUrl: true },
            },
          },
        },
        availability: true,
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Service fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const service = await db.service.findUnique({ where: { id } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.providerId !== user.userId && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You can only update your own services' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'basePrice', 'categoryId', 'subcategoryId',
      'priceNegotiable', 'serviceDurationMinutes', 'serviceAreaRadiusKm',
      'latitude', 'longitude', 'address', 'city', 'state', 'country',
      'pincode', 'images', 'isActive',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['basePrice', 'latitude', 'longitude'].includes(field)) {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else if (['categoryId', 'subcategoryId', 'serviceDurationMinutes', 'serviceAreaRadiusKm'].includes(field)) {
          updateData[field] = body[field] ? parseInt(body[field]) : null;
        } else if (field === 'images') {
          updateData[field] = body[field] ? JSON.stringify(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const updatedService = await db.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const service = await db.service.findUnique({ where: { id } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.providerId !== user.userId && !requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'You can only delete your own services' },
        { status: 403 }
      );
    }

    // Soft delete
    const updatedService = await db.service.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Service deactivated successfully',
      service: updatedService,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Service delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
