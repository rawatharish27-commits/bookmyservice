import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

function generateReferralCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const referrals = await db.referral.findMany({
      where: { referrerId: user.userId },
      include: {
        referredUser: {
          select: { id: true, name: true, email: true, phone: true, profileImageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Referrals fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const {
      referredEmail,
      referredPhone,
      referredName,
      referralType = 'PROVIDER',
      source = 'WHATSAPP',
      message,
    } = body;

    // Validate: at least one contact field is required
    if (!referredEmail && !referredPhone && !referredName) {
      return NextResponse.json(
        { error: 'At least one of referredEmail, referredPhone, or referredName is required' },
        { status: 400 }
      );
    }

    // Validate referralType
    const validTypes = ['PROVIDER', 'CUSTOMER', 'AREA_MANAGER'];
    if (!validTypes.includes(referralType)) {
      return NextResponse.json(
        { error: 'Invalid referralType. Must be PROVIDER, CUSTOMER, or AREA_MANAGER' },
        { status: 400 }
      );
    }

    // Validate source
    const validSources = ['WHATSAPP', 'WEBSITE', 'DIRECT', 'SOCIAL'];
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be WHATSAPP, WEBSITE, DIRECT, or SOCIAL' },
        { status: 400 }
      );
    }

    // Check for duplicate referral (same email or phone by same referrer)
    if (referredEmail) {
      const existing = await db.referral.findFirst({
        where: { referrerId: user.userId, referredEmail, status: { notIn: ['EXPIRED'] } },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'You have already referred this email address', referral: existing },
          { status: 409 }
        );
      }
    }

    if (referredPhone) {
      const existing = await db.referral.findFirst({
        where: { referrerId: user.userId, referredPhone, status: { notIn: ['EXPIRED'] } },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'You have already referred this phone number', referral: existing },
          { status: 409 }
        );
      }
    }

    // Generate unique referral code
    let referralCode = generateReferralCode(user.email);
    let codeExists = await db.referral.findUnique({ where: { referralCode } });
    while (codeExists) {
      referralCode = generateReferralCode(user.email);
      codeExists = await db.referral.findUnique({ where: { referralCode } });
    }

    // Set default expiry to 90 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const referral = await db.referral.create({
      data: {
        referrerId: user.userId,
        referredEmail,
        referredPhone,
        referredName,
        referralCode,
        referralType,
        source,
        message,
        expiresAt,
      },
      include: {
        referrer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create referral error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
