import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/receipts/confirm - Confirm pending receipt and create expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      groupId,
      receiptId,
      participants,
      participantNames,
      customShares,
      splitType = 'simple',
      splitGroups,
      amountCents // Allow amount editing
    } = body;

    if (!userId || !groupId || !receiptId) {
      return NextResponse.json({ 
        error: 'userId, groupId, and receiptId are required' 
      }, { status: 400 });
    }

    console.log('✅ Confirming pending receipt:', receiptId);

    // Get pending receipt
    const pendingReceipt = await prisma.pendingReceipt.findUnique({
      where: { id: receiptId }
    });

    if (!pendingReceipt) {
      return NextResponse.json({ 
        error: 'Pending receipt not found' 
      }, { status: 404 });
    }

    // Check if expired
    if (pendingReceipt.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: 'Pending receipt has expired' 
      }, { status: 410 });
    }

    // Use provided amount or OCR amount
    const finalAmountCents = amountCents || pendingReceipt.totalCents;

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        groupId,
        payerId: userId,
        merchant: pendingReceipt.merchant,
        description: `${pendingReceipt.merchant} - Receipt`,
        amountCents: finalAmountCents,
        currency: 'USD',
        splitType,
        splitGroups: splitGroups ? splitGroups as any : null,
        participants: participants || pendingReceipt.participants,
        participantNames: participantNames ? participantNames as any : pendingReceipt.participantNames,
        customShares: customShares ? customShares as any : null,
        receiptImageUrl: pendingReceipt.imageUrl,
        ocrData: pendingReceipt.ocrResult as any,
        status: 'pending'
      },
      include: {
        payer: true,
        group: true
      }
    });

    // Delete pending receipt
    await prisma.pendingReceipt.delete({
      where: { id: receiptId }
    });

    console.log('✅ Expense created from pending receipt:', expense.id);

    return NextResponse.json({
      success: true,
      expense
    });

  } catch (error) {
    console.error('❌ Failed to confirm pending receipt:', error);
    return NextResponse.json(
      { error: 'Failed to confirm pending receipt' },
      { status: 500 }
    );
  }
}
