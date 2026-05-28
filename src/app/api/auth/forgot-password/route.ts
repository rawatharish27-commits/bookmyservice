import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Always return the same message to prevent email enumeration
    const successMessage = 'If an account with that email exists, a reset link has been sent';

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      // Return same message to avoid revealing whether email exists
      return NextResponse.json({ message: successMessage });
    }

    // Generate a secure reset token (32 bytes = 64 hex characters)
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Invalidate any existing unused reset tokens for this email
    await db.passwordReset.updateMany({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: { used: true },
    });

    // Store the reset token
    await db.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
      },
    });

    // In a real app, send an email with the reset link
    // For now, log the token to console and return it in development mode
    console.log(`[Forgot Password] Reset token for ${email}: ${resetToken}`);

    const response: { message: string; token?: string } = { message: successMessage };

    if (process.env.NODE_ENV === 'development') {
      response.token = resetToken;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
