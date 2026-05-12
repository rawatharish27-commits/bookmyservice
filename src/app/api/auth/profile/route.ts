import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const userProfile = await db.user.findUnique({
      where: { id: user.userId },
      include: { role: true },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: userProfile.id,
      email: userProfile.email,
      phone: userProfile.phone,
      name: userProfile.name,
      role: userProfile.role.name,
      status: userProfile.status,
      emailVerified: userProfile.emailVerified,
      phoneVerified: userProfile.phoneVerified,
      profileImageUrl: userProfile.profileImageUrl,
      address: userProfile.address,
      city: userProfile.city,
      state: userProfile.state,
      country: userProfile.country,
      pincode: userProfile.pincode,
      latitude: userProfile.latitude,
      longitude: userProfile.longitude,
      lastLoginAt: userProfile.lastLoginAt,
      createdAt: userProfile.createdAt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const allowedFields = [
      'name', 'phone', 'address', 'city', 'state', 'country',
      'pincode', 'latitude', 'longitude', 'profileImageUrl',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: user.userId },
      data: updateData,
      include: { role: true },
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      name: updatedUser.name,
      role: updatedUser.role.name,
      status: updatedUser.status,
      profileImageUrl: updatedUser.profileImageUrl,
      address: updatedUser.address,
      city: updatedUser.city,
      state: updatedUser.state,
      country: updatedUser.country,
      pincode: updatedUser.pincode,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
