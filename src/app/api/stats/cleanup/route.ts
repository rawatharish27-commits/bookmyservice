import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Cleanup is handled in-memory by the visitor route
    return NextResponse.json({
      success: true,
      deactivatedCount: 0,
      message: 'Cleanup handled by in-memory visitor tracking',
    });
  } catch (error) {
    console.error('Visitor cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
