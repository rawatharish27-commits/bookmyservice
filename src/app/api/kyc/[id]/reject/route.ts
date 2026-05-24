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
        { error: 'Only admins can reject KYC' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { rejectionReason } = body;

    const kyc = await db.providerKyc.findUnique({ where: { id } });
    if (!kyc) {
      return NextResponse.json({ error: 'KYC record not found' }, { status: 404 });
    }

    const updatedKyc = await db.providerKyc.update({
      where: { id },
      data: {
        verificationStatus: 'REJECTED',
        verifiedBy: user.userId,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason || 'No reason provided',
      },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'REJECT_KYC',
        targetType: 'KYC',
        targetId: id,
        details: JSON.stringify({ rejectionReason }),
      },
    });

    // Notify provider
    await db.notification.create({
      data: {
        userId: kyc.providerId,
        type: 'KYC_REJECTED',
        title: 'KYC Rejected',
        message: `Your KYC documents have been rejected. Reason: ${rejectionReason || 'No reason provided'}`,
      },
    });

    return NextResponse.json(updatedKyc);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('KYC rejection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
