import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { serviceId } = await params;

    const favorite = await db.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId: user.userId,
          serviceId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    await db.favorite.delete({
      where: {
        userId_serviceId: {
          userId: user.userId,
          serviceId,
        },
      },
    });

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
