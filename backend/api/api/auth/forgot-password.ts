/**
 * POST /api/auth/forgot-password
 * Accepts an email address and sends a password reset link.
 * For now, this is a placeholder that always returns success
 * (to avoid revealing whether an email exists in the system).
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { sanitizeString, validateEmail } from '../../_shared/security';

interface ForgotPasswordBody {
  email?: string;
}

export async function onRequestPost(context: EventContext<Record<string, unknown>, string, unknown>): Promise<Response> {
  const { request, env } = context as unknown as { request: Request; env: Env };

  try {
    const body: ForgotPasswordBody = await request.json();
    const { email } = body;

    // ─── Validate required fields ────────────────────────────────
    if (!email) {
      return error('Email address is required', 400);
    }

    // ─── Sanitize and validate email ─────────────────────────────
    const sanitizedEmail = sanitizeString(String(email)).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return error('Invalid email address format', 400);
    }

    // ─── Create Supabase client ──────────────────────────────────
    const supabase = createSupabaseClient(env);

    // ─── Check if user exists ────────────────────────────────────
    const { data: user } = await supabase
      .from('User')
      .select('id, email, name')
      .ilike('email', sanitizedEmail)
      .maybeSingle();

    if (user) {
      // In production, send a password reset email here
      // For now, we just log it and return success
      console.log(`Password reset requested for: ${sanitizedEmail}`);

      // Generate a simple reset token (in production, use a proper token system)
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      // Store the reset token (you could add a PasswordReset table in production)
      // For now, we just acknowledge the request
      console.log(`Reset token generated: ${resetToken}, expires: ${expiresAt}`);
    }

    // Always return success to avoid revealing whether email exists
    return json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      success: true,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    // Still return success for security
    return json({
      message: 'If an account with that email exists, a password reset link has been sent.',
      success: true,
    });
  }
}
