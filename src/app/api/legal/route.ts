import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const legalPages = await db.legalPage.findMany({
      select: {
        id: true,
        pageType: true,
        title: true,
        version: true,
        effectiveDate: true,
      },
    });

    return NextResponse.json(legalPages);
  } catch (error) {
    console.error('Legal pages fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
