import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can approve services' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    if (!action || !['APPROVE', 'REJECT'].includes(action.toUpperCase())) {
      return NextResponse.json(
        { error: 'Action must be APPROVE or REJECT' },
        { status: 400 }
      );
    }

    const service = await db.service.findUnique({ where: { id } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const isApproved = action.toUpperCase() === 'APPROVE';
    const updatedService = await db.service.update({
      where: { id },
      data: {
        isApproved,
        approvalStatus: isApproved ? 'APPROVED' : 'REJECTED',
        approvedBy: user.userId,
        approvedAt: new Date(),
        rejectionReason: isApproved ? null : (rejectionReason || 'No reason provided'),
        isActive: isApproved,
      },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: isApproved ? 'APPROVE_SERVICE' : 'REJECT_SERVICE',
        targetType: 'SERVICE',
        targetId: id,
        details: JSON.stringify({ rejectionReason }),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Service approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
