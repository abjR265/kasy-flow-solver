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

    // First, ensure user and group exist (create if needed)
    await prisma.user.upsert({
      where: { id: payerId },
      update: {},
      create: {
        id: payerId,
        email: `${payerId}@temp.com`,
        displayName: payerId,
        repScore: 50
      }
    });

    // Create all participant users
    for (const participantId of participants) {
      await prisma.user.upsert({
        where: { id: participantId },
        update: {},
        create: {
          id: participantId,
          email: `${participantId}@temp.com`,
          displayName: participantNames?.[participantId] || participantId,
          repScore: 50
        }
      });
    }

    await prisma.group.upsert({
      where: { id: groupId },
      update: {},
      create: {
        id: groupId,
        name: groupId
      }
    });

    // Add all participants as group members
    for (const participantId of participants) {
      await prisma.groupMember.upsert({
        where: {
          groupId_userId: {
            groupId,
            userId: participantId
          }
        },
        update: {},
        create: {
          groupId,
          userId: participantId,
          role: 'member'
        }
      });
    }

    // Also add payer as group member if not already in participants
    if (!participants.includes(payerId)) {
      await prisma.groupMember.upsert({
        where: {
          groupId_userId: {
            groupId,
            userId: payerId
          }
        },
        update: {},
        create: {
          groupId,
          userId: payerId,
          role: 'member'
        }
      });
    }

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
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Failed to create expense',
        details: error instanceof Error ? error.message : String(error)
      },
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
