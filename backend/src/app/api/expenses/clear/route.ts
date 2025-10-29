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

// POST /api/expenses/clear - Clear all expenses for a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId } = body;

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

