import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ─── In-Memory Rate Limiting ────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3; // max submissions per IP per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// ─── Input Validation Helpers ───────────────────────────────────────────────

const MAX_LENGTHS = {
  name: 100,
  email: 255,
  subject: 200,
  message: 2000,
} as const;

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateLength(field: string, value: string, max: number): string | null {
  if (value.length > max) {
    return `${field} must be at most ${max} characters`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { name, email, subject, message } = body;

    // Required field check
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      );
    }

    // Ensure all fields are strings
    name = String(name);
    email = String(email);
    subject = String(subject);
    message = String(message);

    // HTML sanitization — strip tags from all inputs
    name = stripHtml(name);
    email = stripHtml(email);
    subject = stripHtml(subject);
    message = stripHtml(message);

    // Length validation
    const lengthErrors: string[] = [];
    const fields: Array<{ field: string; value: string; max: number }> = [
      { field: 'Name', value: name, max: MAX_LENGTHS.name },
      { field: 'Email', value: email, max: MAX_LENGTHS.email },
      { field: 'Subject', value: subject, max: MAX_LENGTHS.subject },
      { field: 'Message', value: message, max: MAX_LENGTHS.message },
    ];
    for (const { field, value, max } of fields) {
      const err = validateLength(field, value, max);
      if (err) lengthErrors.push(err);
    }
    if (lengthErrors.length > 0) {
      return NextResponse.json(
        { error: lengthErrors.join('. ') },
        { status: 400 }
      );
    }

    // Email format validation
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    return NextResponse.json(
      {
        message: 'Contact message submitted successfully',
        id: contactMessage.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
