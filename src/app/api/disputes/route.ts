import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { bookingId, disputeType, description, evidence } = body;

    if (!bookingId || !disputeType || !description) {
      return NextResponse.json(
        { error: 'Booking ID, dispute type, and description are required' },
        { status: 400 }
      );
    }

    const validTypes = ['PAYMENT', 'SERVICE_QUALITY', 'NO_SHOW', 'CANCELLATION', 'OTHER'];
    if (!validTypes.includes(disputeType.toUpperCase())) {
      return NextResponse.json(
        { error: `Dispute type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const booking = await db.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (
      booking.clientId !== user.userId &&
      booking.providerId !== user.userId
    ) {
      return NextResponse.json(
        { error: 'Only involved parties can raise disputes' },
        { status: 403 }
      );
    }

    const dispute = await db.dispute.create({
      data: {
        bookingId,
        raisedBy: user.userId,
        disputeType: disputeType.toUpperCase(),
        description,
        evidence: evidence ? JSON.stringify(evidence) : null,
        status: 'OPEN',
      },
    });

    // Notify admin (find admin users)
    const admins = await db.user.findMany({
      where: { role: { name: 'ADMIN' } },
      take: 5,
    });

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: 'NEW_DISPUTE',
          title: 'New Dispute Raised',
          message: `A new dispute has been raised for booking #${booking.bookingNumber}`,
          actionUrl: `/admin/disputes/${dispute.id}`,
        },
      });
    }

    // Notify the other party
    const notifyUserId =
      user.userId === booking.clientId ? booking.providerId : booking.clientId;
    await db.notification.create({
      data: {
        userId: notifyUserId,
        type: 'DISPUTE_RAISED',
        title: 'Dispute Raised',
        message: `A dispute has been raised for booking #${booking.bookingNumber}`,
        actionUrl: `/bookings/${booking.id}`,
      },
    });

    return NextResponse.json(dispute, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dispute creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    if (user.role === 'ADMIN') {
      // Admin can see all
    } else {
      where.raisedBy = user.userId;
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    const [disputes, total] = await Promise.all([
      db.dispute.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              service: { select: { id: true, title: true } },
            },
          },
          raiser: { select: { id: true, name: true, profileImageUrl: true } },
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.dispute.count({ where }),
    ]);

    return NextResponse.json({
      disputes,
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
    console.error('Disputes fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
