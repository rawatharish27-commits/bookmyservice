import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BYS-${year}-${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (user.role === 'CLIENT') {
      where.clientId = user.userId;
    } else if (user.role === 'PROVIDER') {
      where.providerId = user.userId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const [bookings, total] = await Promise.all([
      db.booking.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              title: true,
              basePrice: true,
              images: true,
            },
          },
          client: {
            select: { id: true, name: true, profileImageUrl: true },
          },
          provider: {
            select: { id: true, name: true, profileImageUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'CLIENT' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only clients can create bookings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      serviceAddress,
      serviceLatitude,
      serviceLongitude,
      distanceKm,
      specialInstructions,
    } = body;

    if (!serviceId || !scheduledDate || !scheduledTime || !serviceAddress) {
      return NextResponse.json(
        { error: 'Service ID, scheduled date, time, and address are required' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    if (!service.isActive || !service.isApproved) {
      return NextResponse.json(
        { error: 'Service is not available for booking' },
        { status: 400 }
      );
    }

    const basePrice = service.basePrice;
    const platformFee = Math.max(5, basePrice * 0.05);
    const finalPrice = basePrice + platformFee;

    const booking = await db.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        clientId: user.userId,
        providerId: service.providerId,
        serviceId,
        status: 'PENDING',
        scheduledDate,
        scheduledTime,
        serviceAddress,
        serviceLatitude: serviceLatitude ? parseFloat(serviceLatitude) : null,
        serviceLongitude: serviceLongitude ? parseFloat(serviceLongitude) : null,
        distanceKm: distanceKm ? parseFloat(distanceKm) : null,
        basePrice,
        finalPrice,
        platformFee,
        providerEarnings: basePrice - platformFee,
        specialInstructions,
      },
      include: {
        service: { select: { id: true, title: true, basePrice: true } },
        provider: { select: { id: true, name: true, profileImageUrl: true } },
      },
    });

    // Create notification for provider
    await db.notification.create({
      data: {
        userId: service.providerId,
        type: 'NEW_BOOKING',
        title: 'New Booking Request',
        message: `You have a new booking request for "${service.title}"`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
