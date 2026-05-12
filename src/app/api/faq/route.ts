import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const faqs = await db.faq.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { displayOrder: 'asc' }],
    });

    // Group by category
    const grouped = faqs.reduce(
      (acc, faq) => {
        if (!acc[faq.category]) {
          acc[faq.category] = [];
        }
        acc[faq.category].push({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
        });
        return acc;
      },
      {} as Record<string, Array<{ id: number; question: string; answer: string }>>
    );

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('FAQ fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
