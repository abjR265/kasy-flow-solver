import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/receipts/pending/[userId] - Store pending receipt
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const body = await request.json();
    const {
      userName,
      groupId,
      messageId,
      imageUrl,
      ocrResult,
      totalCents,
      merchant,
      caption,
      participants,
      participantNames,
      calculationContext
    } = body;

    if (!imageUrl || !ocrResult || !totalCents) {
      return NextResponse.json({ 
        error: 'imageUrl, ocrResult, and totalCents are required' 
      }, { status: 400 });
    }

    console.log('💾 Storing pending receipt for user:', userId);

    // Clean up any existing pending receipts for this user
    await prisma.pendingReceipt.deleteMany({
      where: {
        userId,
        groupId: groupId || 'default'
      }
    });

    // Store new pending receipt
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    const pendingReceipt = await prisma.pendingReceipt.create({
      data: {
        userId,
        userName: userName || 'User',
        groupId: groupId || 'default',
        messageId: messageId || 0,
        imageUrl,
        ocrResult: ocrResult as any,
        totalCents,
        merchant: merchant || 'Unknown Merchant',
        caption,
        participants: participants || [],
        participantNames: participantNames ? participantNames as any : null,
        calculationContext: calculationContext ? calculationContext as any : null,
        expiresAt
      }
    });

    console.log('✅ Pending receipt stored:', pendingReceipt.id);

    return NextResponse.json({
      success: true,
      receiptId: pendingReceipt.id,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to store pending receipt:', error);
    return NextResponse.json(
      { error: 'Failed to store pending receipt' },
      { status: 500 }
    );
  }
}

// GET /api/receipts/pending/[userId] - Get pending receipt
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId') || 'default';

    console.log('🔍 Getting pending receipt for user:', userId, 'in group:', groupId);

    const pendingReceipt = await prisma.pendingReceipt.findFirst({
      where: {
        userId,
        groupId,
        expiresAt: { gt: new Date() } // Only get non-expired receipts
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!pendingReceipt) {
      return NextResponse.json({
        success: false,
        message: 'No pending receipt found'
      });
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: pendingReceipt.id,
        userId: pendingReceipt.userId,
        userName: pendingReceipt.userName,
        groupId: pendingReceipt.groupId,
        imageUrl: pendingReceipt.imageUrl,
        ocrResult: pendingReceipt.ocrResult,
        totalCents: pendingReceipt.totalCents,
        merchant: pendingReceipt.merchant,
        caption: pendingReceipt.caption,
        participants: pendingReceipt.participants,
        participantNames: pendingReceipt.participantNames,
        calculationContext: pendingReceipt.calculationContext,
        expiresAt: pendingReceipt.expiresAt
      }
    });

  } catch (error) {
    console.error('❌ Failed to get pending receipt:', error);
    return NextResponse.json(
      { error: 'Failed to get pending receipt' },
      { status: 500 }
    );
  }
}
