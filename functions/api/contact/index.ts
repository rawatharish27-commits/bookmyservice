/**
 * POST /api/contact - Submit contact form
 *   - Validates: name, email, subject, message
 *   - Creates contact submission record
 *   - Rate limited (handled by middleware)
 */

import { createSupabaseClient, Env } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { sanitizeString, sanitizeObject, validateEmail } from '../../_shared/security';

function generateId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
    const supabase = createSupabaseClient(context.env);
    const body = await context.request.json() as Record<string, unknown>;
    const sanitized = sanitizeObject(body);

    const name = sanitizeString(String(sanitized.name || ''));
    const email = sanitizeString(String(sanitized.email || ''));
    const subject = sanitizeString(String(sanitized.subject || ''));
    const message = sanitizeString(String(sanitized.message || ''));

    // Validate required fields
    if (!name) return error('name is required');
    if (!email) return error('email is required');
    if (!subject) return error('subject is required');
    if (!message) return error('message is required');

    // Validate email format
    if (!validateEmail(email)) {
      return error('Invalid email format');
    }

    // Validate lengths
    if (name.length > 100) return error('name must be at most 100 characters');
    if (subject.length > 200) return error('subject must be at most 200 characters');
    if (message.length > 5000) return error('message must be at most 5000 characters');

    const id = generateId();
    const now = new Date().toISOString();

    const { error: insertError } = await supabase
      .from('ContactMessage')
      .insert({
        id,
        name,
        email,
        subject,
        message,
        isRead: false,
        createdAt: now,
      });

    if (insertError) {
      console.error('Contact form insert error:', insertError);
      return error('Failed to submit contact form', 500);
    }

    return json({
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon!',
      id,
    }, 201);
  } catch (err) {
    console.error('Contact form error:', err);
    return error('Failed to submit contact form', 500);
  }
}
