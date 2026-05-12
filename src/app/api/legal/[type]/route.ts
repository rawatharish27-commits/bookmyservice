import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;

    const legalPage = await db.legalPage.findUnique({
      where: { pageType: type.toUpperCase() },
    });

    if (!legalPage) {
      return NextResponse.json(
        { error: 'Legal page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(legalPage);
  } catch (error) {
    console.error('Legal page fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
