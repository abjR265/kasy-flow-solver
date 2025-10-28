import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/payments/profile/[userId] - Get payment profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        venmo: true,
        paypal: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: {
        userId: user.id,
        userName: user.displayName,
        venmo: user.venmo,
        paypal: user.paypal
      }
    });

  } catch (error) {
    console.error('❌ Failed to get payment profile:', error);
    return NextResponse.json(
      { error: 'Failed to get payment profile' },
      { status: 500 }
    );
  }
}

// PUT /api/payments/profile/[userId] - Update payment profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { venmo, paypal } = body;

    console.log('✏️ Updating payment profile for user:', userId);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        venmo,
        paypal,
        updatedAt: new Date()
      },
      select: {
        id: true,
        displayName: true,
        venmo: true,
        paypal: true
      }
    });

    console.log('✅ Payment profile updated:', user.id);

    return NextResponse.json({
      success: true,
      profile: {
        userId: user.id,
        userName: user.displayName,
        venmo: user.venmo,
        paypal: user.paypal
      }
    });

  } catch (error) {
    console.error('❌ Failed to update payment profile:', error);
    return NextResponse.json(
      { error: 'Failed to update payment profile' },
      { status: 500 }
    );
  }
}
