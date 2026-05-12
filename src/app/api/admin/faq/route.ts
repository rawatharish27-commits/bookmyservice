import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can access FAQ management' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const faqs = await db.faq.findMany({
      where,
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    return NextResponse.json(faqs);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin FAQ list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can create FAQs' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, question, answer, displayOrder, isActive } = body;

    if (!category || !question || !answer) {
      return NextResponse.json(
        { error: 'Category, question, and answer are required' },
        { status: 400 }
      );
    }

    const faq = await db.faq.create({
      data: {
        category,
        question,
        answer,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // Log admin action
    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'CREATE_FAQ',
        targetType: 'FAQ',
        targetId: String(faq.id),
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('FAQ creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
