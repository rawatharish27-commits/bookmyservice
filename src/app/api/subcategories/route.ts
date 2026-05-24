import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json({ subcategories: [] });
    }

    const subcategories = await db.serviceSubcategory.findMany({
      where: {
        categoryId: parseInt(categoryId),
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ subcategories });
  } catch (error) {
    console.error('Subcategories fetch error:', error);
    return NextResponse.json({ subcategories: [] }, { status: 500 });
  }
}
