import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// CORS headers - v2024-10-29
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
};

// Handle preflight requests (for all methods including DELETE)
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders
  });
}

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
      }, { status: 400, headers: corsHeaders });
    }

    console.log('💾 Creating expense:', description, amountCents);

    // First, ensure user and group exist (create if needed)
    await prisma.user.upsert({
      where: { id: payerId },
      update: {},
      create: {
        id: payerId,
        email: `${payerId}@temp.com`,
        username: payerId === 'user-1' ? 'alice' : payerId, // Map user-1 to alice
        displayName: payerId === 'user-1' ? 'Alice' : payerId,
        avatarUrl: payerId === 'user-1' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' : '',
        repScore: 50
      }
    });

    // Create all participant users
    for (const participantId of participants) {
      const participantName = participantNames?.[participantId] || participantId;
      const cleanName = participantName.startsWith('@') ? participantName.slice(1) : participantName;
      
      await prisma.user.upsert({
        where: { id: participantId },
        update: {},
        create: {
          id: participantId,
          email: `${cleanName}@temp.com`,
          username: cleanName.toLowerCase(),
          displayName: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName}`,
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
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Failed to create expense:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Failed to create expense',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500, headers: corsHeaders }
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
      }, { status: 400, headers: corsHeaders });
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
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Failed to get expenses:', error);
    return NextResponse.json(
      { error: 'Failed to get expenses' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/expenses?groupId=xxx - Clear all expenses for a group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json({ 
        error: 'groupId is required' 
      }, { status: 400, headers: corsHeaders });
    }

    // Delete all payments first (foreign key constraint)
    await prisma.payment.deleteMany({
      where: {
        expense: {
          groupId
        }
      }
    });

    // Then delete all expenses
    const result = await prisma.expense.deleteMany({
      where: { groupId }
    });

    console.log(`🗑️ Deleted ${result.count} expenses from group ${groupId}`);

    return NextResponse.json({
      success: true,
      deletedCount: result.count
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Failed to clear expenses:', error);
    return NextResponse.json(
      { error: 'Failed to clear expenses' },
      { status: 500, headers: corsHeaders }
    );
  }
}
