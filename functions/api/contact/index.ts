/**
 * POST /api/contact - Submit contact form
 *   - Validates: name, email, subject, message
 *   - Creates contact submission record
 *   - Rate limited (handled by middleware)
 */

import { execute } from '../../_shared/db';
import { json, error } from '../../_shared/response';
import { sanitizeString, sanitizeObject, validateEmail } from '../../_shared/security';

interface Env {
  DB: D1Database;
}

function generateId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}

export async function onRequestPost(context: { request: Request; env: Env; params: Record<string, string> }): Promise<Response> {
  try {
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

    await execute(
      context.env.DB,
      `INSERT INTO ContactMessage (id, name, email, subject, message, isRead, createdAt)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now'))`,
      [id, name, email, subject, message]
    );

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
