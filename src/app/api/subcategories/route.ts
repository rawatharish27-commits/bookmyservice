import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where: Record<string, unknown> = { isActive: true };
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const subcategories = await db.serviceSubcategory.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { services: true },
        },
      },
      orderBy: [{ categoryId: 'asc' }, { displayOrder: 'asc' }],
    });

    return NextResponse.json(
      subcategories.map((sub) => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        displayOrder: sub.displayOrder,
        category: sub.category,
        servicesCount: sub._count.services,
      }))
    );
  } catch (error) {
    console.error('Subcategories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
