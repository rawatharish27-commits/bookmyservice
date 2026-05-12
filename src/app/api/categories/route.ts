import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.serviceCategory.findMany({
      where: { isActive: true, parentId: null },
      include: {
        _count: {
          select: { children: true, services: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        iconUrl: cat.iconUrl,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        subcategoriesCount: cat._count.children,
        servicesCount: cat._count.services,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
      }))
    );
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
