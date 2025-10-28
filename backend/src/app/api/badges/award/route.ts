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
