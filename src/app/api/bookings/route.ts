import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

function generateBookingNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `BMS-${y}${m}${d}-${seq}`;
}

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10'), 1), 100);
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
      bookingType,
    } = body;

    if (!serviceId || !scheduledDate || !scheduledTime || !serviceAddress) {
      return NextResponse.json(
        { error: 'Service ID, scheduled date, time, and address are required' },
        { status: 400 }
      );
    }

    // Validate the service exists and is active
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: {
          select: { id: true, name: true, status: true, profileImageUrl: true },
        },
      },
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

    // Validate the provider exists and is active
    if (service.provider.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Service provider is not available' },
        { status: 400 }
      );
    }

    const basePrice = service.basePrice;
    const platformFee = Math.max(5, basePrice * 0.05);
    const finalPrice = basePrice + platformFee;

    // Generate booking number (BMS-YYYYMMDD-XXXX) and OTP code
    const bookingNumber = generateBookingNumber();
    const otpCode = generateOtpCode();

    const booking = await db.booking.create({
      data: {
        bookingNumber,
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
        bookingType: bookingType || 'NORMAL',
        otpCode,
        warrantyDays: 90,
      },
      include: {
        service: { select: { id: true, title: true, basePrice: true } },
        provider: { select: { id: true, name: true, profileImageUrl: true } },
      },
    });

    // Create BookingTimeline entry for booking creation
    await db.bookingTimeline.create({
      data: {
        bookingId: booking.id,
        status: 'PENDING',
        description: `Booking created by ${user.email}`,
        performedBy: user.userId,
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
