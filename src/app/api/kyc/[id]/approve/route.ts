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
        { error: 'Only admins can approve KYC' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const kyc = await db.providerKyc.findUnique({ where: { id } });
    if (!kyc) {
      return NextResponse.json({ error: 'KYC record not found' }, { status: 404 });
    }

    if (kyc.verificationStatus === 'APPROVED') {
      return NextResponse.json(
        { error: 'KYC is already approved' },
        { status: 400 }
      );
    }

    const updatedKyc = await db.providerKyc.update({
      where: { id },
      data: {
        verificationStatus: 'APPROVED',
        verifiedBy: user.userId,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
    });

    // Update user status
    await db.user.update({
      where: { id: kyc.providerId },
      data: { status: 'ACTIVE' },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'APPROVE_KYC',
        targetType: 'KYC',
        targetId: id,
      },
    });

    // Notify provider
    await db.notification.create({
      data: {
        userId: kyc.providerId,
        type: 'KYC_APPROVED',
        title: 'KYC Approved',
        message: 'Your KYC documents have been verified and approved',
      },
    });

    return NextResponse.json(updatedKyc);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('KYC approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
