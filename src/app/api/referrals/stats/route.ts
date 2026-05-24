import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Get all referrals for this user
    const referrals = await db.referral.findMany({
      where: { referrerId: user.userId },
    });

    // Calculate stats
    const totalReferrals = referrals.length;
    const pendingReferrals = referrals.filter((r) => r.status === 'PENDING').length;
    const registeredReferrals = referrals.filter((r) => r.status === 'REGISTERED').length;
    const activeReferrals = referrals.filter((r) => r.status === 'ACTIVE').length;
    const completedReferrals = referrals.filter((r) => r.status === 'COMPLETED').length;
    const expiredReferrals = referrals.filter((r) => r.status === 'EXPIRED').length;

    // Total earnings from referrals
    const totalEarnings = referrals.reduce((sum, r) => sum + r.totalEarnings, 0);
    const totalBookings = referrals.reduce((sum, r) => sum + r.totalBookings, 0);

    // By type breakdown
    const providerReferrals = referrals.filter((r) => r.referralType === 'PROVIDER').length;
    const customerReferrals = referrals.filter((r) => r.referralType === 'CUSTOMER').length;
    const areaManagerReferrals = referrals.filter((r) => r.referralType === 'AREA_MANAGER').length;

    // By source breakdown
    const bySource: Record<string, number> = {};
    for (const r of referrals) {
      bySource[r.source] = (bySource[r.source] || 0) + 1;
    }

    // Get commissions earned from referrals
    const commissions = await db.commission.findMany({
      where: {
        userId: user.userId,
        commissionType: 'REFERRAL',
      },
    });
    const totalCommissionEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
    const pendingCommission = commissions
      .filter((c) => c.status === 'PENDING')
      .reduce((sum, c) => sum + c.amount, 0);
    const paidCommission = commissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + c.amount, 0);

    // Get user's default commission rate from their most recent referral
    const defaultCommissionRate = referrals.length > 0 ? referrals[0].commissionRate : 0.05;

    return NextResponse.json({
      totalReferrals,
      pendingReferrals,
      registeredReferrals,
      activeReferrals,
      completedReferrals,
      expiredReferrals,
      totalEarnings,
      totalBookings,
      providerReferrals,
      customerReferrals,
      areaManagerReferrals,
      bySource,
      totalCommissionEarned,
      pendingCommission,
      paidCommission,
      defaultCommissionRate,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Referral stats fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
