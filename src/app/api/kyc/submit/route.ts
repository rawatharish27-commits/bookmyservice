import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only providers can submit KYC documents' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      documentType,
      documentNumber,
      documentFrontUrl,
      documentBackUrl,
      selfieUrl,
    } = body;

    if (!documentType || !documentNumber || !documentFrontUrl || !selfieUrl) {
      return NextResponse.json(
        { error: 'Document type, number, front image, and selfie are required' },
        { status: 400 }
      );
    }

    const validDocTypes = ['AADHAAR', 'PAN', 'DRIVING_LICENSE', 'PASSPORT'];
    if (!validDocTypes.includes(documentType.toUpperCase())) {
      return NextResponse.json(
        { error: `Document type must be one of: ${validDocTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Upsert KYC record
    const kyc = await db.providerKyc.upsert({
      where: { providerId: user.userId },
      update: {
        documentType: documentType.toUpperCase(),
        documentNumber,
        documentFrontUrl,
        documentBackUrl: documentBackUrl || null,
        selfieUrl,
        verificationStatus: 'PENDING',
        rejectionReason: null,
        verifiedBy: null,
        verifiedAt: null,
      },
      create: {
        providerId: user.userId,
        documentType: documentType.toUpperCase(),
        documentNumber,
        documentFrontUrl,
        documentBackUrl: documentBackUrl || null,
        selfieUrl,
        verificationStatus: 'PENDING',
      },
    });

    // Notify admins
    const admins = await db.user.findMany({
      where: { role: { name: 'ADMIN' } },
      take: 5,
    });

    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: 'KYC_SUBMITTED',
          title: 'New KYC Submission',
          message: `A provider has submitted KYC documents for verification`,
          actionUrl: `/admin/kyc/${kyc.id}`,
        },
      });
    }

    return NextResponse.json(kyc, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('KYC submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
