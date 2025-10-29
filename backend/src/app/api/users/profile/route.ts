import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders
  });
}

// POST /api/users/profile - Update user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName, handle, venmo, paypal, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required' 
      }, { status: 400, headers: corsHeaders });
    }

    console.log('💾 Updating profile for user:', userId);

    // Extract username from handle
    const username = handle?.startsWith('@') ? handle.slice(1) : handle;

    // Update user
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        displayName: displayName || undefined,
        username: username || undefined,
        venmo: venmo || undefined,
        paypal: paypal || undefined,
        avatarUrl: avatarUrl || undefined,
        updatedAt: new Date()
      },
      create: {
        id: userId,
        email: `${userId}@temp.com`,
        displayName: displayName || userId,
        username: username || userId,
        venmo: venmo,
        paypal: paypal,
        avatarUrl: avatarUrl,
        repScore: 50
      }
    });

    console.log('✅ Profile updated:', user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        handle: `@${user.username}`,
        venmo: user.venmo,
        paypal: user.paypal,
        avatarUrl: user.avatarUrl
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500, headers: corsHeaders }
    );
  }
}

