import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, requireRole } from '@/lib/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can update FAQs' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const faq = await db.faq.findUnique({ where: { id: parseInt(id) } });
    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.category !== undefined) updateData.category = body.category;
    if (body.question !== undefined) updateData.question = body.question;
    if (body.answer !== undefined) updateData.answer = body.answer;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedFaq = await db.faq.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'UPDATE_FAQ',
        targetType: 'FAQ',
        targetId: id,
      },
    });

    return NextResponse.json(updatedFaq);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('FAQ update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);

    if (!requireRole(user, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only admins can delete FAQs' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const faq = await db.faq.findUnique({ where: { id: parseInt(id) } });
    if (!faq) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
    }

    await db.faq.delete({ where: { id: parseInt(id) } });

    await db.adminLog.create({
      data: {
        adminId: user.userId,
        action: 'DELETE_FAQ',
        targetType: 'FAQ',
        targetId: id,
      },
    });

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('FAQ delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
