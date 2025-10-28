import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/expenses - Create expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      groupId,
      payerId,
      merchant,
      description,
      amountCents,
      currency = 'USD',
      splitType = 'simple',
      splitGroups,
      participants,
      participantNames,
      customShares,
      receiptImageUrl,
      ocrData
    } = body;

    if (!groupId || !payerId || !description || !amountCents || !participants) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    console.log('💾 Creating expense:', description, amountCents);

    const expense = await prisma.expense.create({
      data: {
        groupId,
        payerId,
        merchant,
        description,
        amountCents,
        currency,
        splitType,
        splitGroups: splitGroups ? splitGroups as any : null,
        participants,
        participantNames: participantNames ? participantNames as any : null,
        customShares: customShares ? customShares as any : null,
        receiptImageUrl,
        ocrData: ocrData ? ocrData as any : null,
        status: 'pending'
      },
      include: {
        payer: true,
        group: true
      }
    });

    console.log('✅ Expense created:', expense.id);

    return NextResponse.json({
      success: true,
      expense
    });

  } catch (error) {
    console.error('❌ Failed to create expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

// GET /api/expenses?groupId=xxx - List group expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ 
        error: 'groupId is required' 
      }, { status: 400 });
    }

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        payer: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      expenses
    });

  } catch (error) {
    console.error('❌ Failed to get expenses:', error);
    return NextResponse.json(
      { error: 'Failed to get expenses' },
      { status: 500 }
    );
  }
}
