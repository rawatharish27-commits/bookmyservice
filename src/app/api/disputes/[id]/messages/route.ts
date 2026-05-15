import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const { message, attachments } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        booking: { select: { clientId: true, providerId: true } },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Only involved parties or admin can send messages
    if (
      dispute.raisedBy !== user.userId &&
      dispute.booking.clientId !== user.userId &&
      dispute.booking.providerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const disputeMessage = await db.disputeMessage.create({
      data: {
        disputeId: id,
        senderId: user.userId,
        message,
        attachments: attachments ? JSON.stringify(attachments) : null,
      },
      include: {
        sender: { select: { id: true, name: true, profileImageUrl: true } },
      },
    });

    return NextResponse.json(disputeMessage, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dispute message creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: { booking: { select: { clientId: true, providerId: true } } },
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    if (
      dispute.raisedBy !== user.userId &&
      dispute.booking.clientId !== user.userId &&
      dispute.booking.providerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await db.disputeMessage.findMany({
      where: { disputeId: id },
      include: {
        sender: { select: { id: true, name: true, profileImageUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dispute messages fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
