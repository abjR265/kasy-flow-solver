import { NextRequest, NextResponse } from 'next/server';
import { getUserBadges } from '@/lib/badges';

// GET /api/badges/[userId] - Get user badges
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    console.log('🏅 Getting badges for user:', userId, groupId ? `in group: ${groupId}` : '');

    const badges = await getUserBadges(userId, groupId || undefined);

    return NextResponse.json({
      success: true,
      badges
    });

  } catch (error) {
    console.error('❌ Failed to get badges:', error);
    return NextResponse.json(
      { error: 'Failed to get badges' },
      { status: 500 }
    );
  }
}
