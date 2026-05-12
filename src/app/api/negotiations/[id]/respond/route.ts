import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const { action, counterPrice, message } = body;

    if (!action || !['ACCEPT', 'REJECT', 'COUNTER'].includes(action.toUpperCase())) {
      return NextResponse.json(
        { error: 'Action must be ACCEPT, REJECT, or COUNTER' },
        { status: 400 }
      );
    }

    const negotiation = await db.negotiation.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!negotiation) {
      return NextResponse.json(
        { error: 'Negotiation not found' },
        { status: 404 }
      );
    }

    // Only the other party can respond
    if (negotiation.proposedBy === user.userId) {
      return NextResponse.json(
        { error: 'You cannot respond to your own negotiation' },
        { status: 403 }
      );
    }

    if (
      negotiation.booking.clientId !== user.userId &&
      negotiation.booking.providerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (negotiation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending negotiations can be responded to' },
        { status: 400 }
      );
    }

    const actionUpper = action.toUpperCase();

    if (actionUpper === 'COUNTER' && !counterPrice) {
      return NextResponse.json(
        { error: 'Counter price is required for COUNTER action' },
        { status: 400 }
      );
    }

    // Update negotiation
    const updatedNegotiation = await db.negotiation.update({
      where: { id },
      data: {
        status: actionUpper === 'COUNTER' ? 'COUNTER' : actionUpper,
        respondedAt: new Date(),
      },
    });

    // If accepted, update booking price
    if (actionUpper === 'ACCEPT') {
      const newPrice = negotiation.proposedPrice;
      const platformFee = Math.max(5, newPrice * 0.05);
      const finalPrice = newPrice + platformFee;

      await db.booking.update({
        where: { id: negotiation.bookingId },
        data: {
          negotiatedPrice: newPrice,
          finalPrice,
          platformFee,
          providerEarnings: newPrice - platformFee,
        },
      });
    }

    // If counter, create new negotiation
    if (actionUpper === 'COUNTER') {
      await db.negotiation.create({
        data: {
          bookingId: negotiation.bookingId,
          serviceId: negotiation.serviceId,
          proposedBy: user.userId,
          proposedPrice: parseFloat(counterPrice),
          message: message || null,
          status: 'PENDING',
        },
      });
    }

    // Notify proposer
    await db.notification.create({
      data: {
        userId: negotiation.proposedBy,
        type: 'NEGOTIATION_RESPONSE',
        title: 'Negotiation Response',
        message: `Your price negotiation for booking #${negotiation.booking.bookingNumber} has been ${actionUpper.toLowerCase()}ed`,
        actionUrl: `/bookings/${negotiation.bookingId}`,
      },
    });

    return NextResponse.json(updatedNegotiation);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Negotiation respond error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
