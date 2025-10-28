import { NextRequest, NextResponse } from 'next/server';
import { awardBadge, getUserBadges } from '@/lib/badges';

// POST /api/badges/award - Award badge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, groupId, badgeType, metadata } = body;

    if (!userId || !groupId || !badgeType) {
      return NextResponse.json({ 
        error: 'userId, groupId, and badgeType are required' 
      }, { status: 400 });
    }

    console.log('🏅 Awarding badge:', badgeType, 'to user:', userId);

    const awarded = await awardBadge(userId, groupId, badgeType, metadata);

    if (!awarded) {
      return NextResponse.json({
        success: false,
        message: 'Badge already awarded this month or failed to award'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Badge awarded successfully'
    });

  } catch (error) {
    console.error('❌ Failed to award badge:', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}

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
