import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { signAccessToken, signRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password, name, role } = body;

    if (!email || !phone || !password || !name) {
      return NextResponse.json(
        { error: 'Email, phone, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Check if phone already exists
    const existingPhone = await db.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 409 }
      );
    }

    // Find role
    const roleName = role?.toUpperCase() || 'CLIENT';
    const roleRecord = await db.role.findUnique({ where: { name: roleName } });
    if (!roleRecord) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Hash password (WebCrypto PBKDF2, Cloudflare-compatible)
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        phone,
        passwordHash,
        name,
        roleId: roleRecord.id,
        status: 'PENDING',
      },
      include: { role: true },
    });

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      role: user.role.name,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken(tokenPayload);

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          name: user.name,
          role: user.role.name,
          status: user.status,
        },
        accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
