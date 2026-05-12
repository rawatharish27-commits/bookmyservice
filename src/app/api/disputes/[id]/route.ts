import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            clientId: true,
            providerId: true,
            service: { select: { id: true, title: true } },
          },
        },
        raiser: { select: { id: true, name: true, profileImageUrl: true } },
        assignee: { select: { id: true, name: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, profileImageUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    // Only involved parties or admin
    if (
      dispute.raisedBy !== user.userId &&
      dispute.booking.clientId !== user.userId &&
      dispute.booking.providerId !== user.userId &&
      user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(dispute);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dispute fetch error:', error);
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

    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, assignedTo, resolution } = body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      const validStatuses = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'];
      if (!validStatuses.includes(status.toUpperCase())) {
        return NextResponse.json(
          { error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status.toUpperCase();

      if (status.toUpperCase() === 'RESOLVED' && resolution) {
        updateData.resolution = resolution;
        updateData.resolvedAt = new Date();
      }
    }

    if (assignedTo && requireRole(user, 'ADMIN')) {
      updateData.assignedTo = assignedTo;
    }

    const updatedDispute = await db.dispute.update({
      where: { id },
      data: updateData,
    });

    // Log admin action
    if (requireRole(user, 'ADMIN')) {
      await db.adminLog.create({
        data: {
          adminId: user.userId,
          action: 'UPDATE_DISPUTE',
          targetType: 'DISPUTE',
          targetId: id,
          details: JSON.stringify(updateData),
        },
      });
    }

    // Notify involved parties
    await db.notification.create({
      data: {
        userId: dispute.raisedBy,
        type: 'DISPUTE_UPDATE',
        title: 'Dispute Update',
        message: `Your dispute has been updated to ${status || 'modified'}`,
        actionUrl: `/disputes/${id}`,
      },
    });

    return NextResponse.json(updatedDispute);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dispute update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
