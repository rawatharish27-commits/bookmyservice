import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const kyc = await db.providerKyc.findUnique({
      where: { providerId: user.userId },
    });

    if (!kyc) {
      return NextResponse.json({
        status: 'NOT_SUBMITTED',
        message: 'No KYC documents submitted yet',
      });
    }

    return NextResponse.json({
      id: kyc.id,
      documentType: kyc.documentType,
      verificationStatus: kyc.verificationStatus,
      rejectionReason: kyc.rejectionReason,
      verifiedAt: kyc.verifiedAt,
      createdAt: kyc.createdAt,
      updatedAt: kyc.updatedAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('KYC status fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
