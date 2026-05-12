import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can access user details' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const targetUser = await db.user.findUnique({
      where: { id },
      include: {
        role: { select: { id: true, name: true } },
        providerKyc: true,
        _count: {
          select: {
            services: true,
            clientBookings: true,
            providerBookings: true,
            reviewsGiven: true,
            reviewsReceived: true,
            favorites: true,
          },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin user detail error:', error);
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

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can update user status' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['ACTIVE', 'BLOCKED', 'PENDING', 'SUSPENDED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'UPDATE_USER_STATUS',
        targetType: 'USER',
        targetId: id,
        details: JSON.stringify({ status }),
      },
    });

    // Notify user
    await db.notification.create({
      data: {
        userId: id,
        type: 'ACCOUNT_STATUS_CHANGE',
        title: 'Account Status Updated',
        message: `Your account status has been updated to ${status.toUpperCase()}`,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
