import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateBalances, calculateSettlements } from '@/lib/calculations';

// GET /api/exports/pdf/[groupId] - Generate PDF export
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const groupId = params.groupId;

    console.log('📄 Generating PDF export for group:', groupId);

    // Get group info
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ 
        error: 'Group not found' 
      }, { status: 404 });
    }

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        payer: true,
        payments: {
          include: {
            fromUser: true,
            toUser: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate balances and settlements
    const balances = await calculateBalances(groupId);
    const settlements = await calculateSettlements(balances, groupId);

    // Generate PDF content (simplified for now)
    const pdfContent = {
      group: {
        name: group.name,
        description: group.description,
        memberCount: group.members.length
      },
      expenses: expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        merchant: expense.merchant,
        amount: expense.amountCents / 100,
        currency: expense.currency,
        payer: expense.payer.displayName,
        participants: expense.participants.length,
        createdAt: expense.createdAt,
        status: expense.status
      })),
      balances: balances.map(balance => ({
        userName: balance.userName,
        balance: balance.balance / 100
      })),
      settlements: settlements.map(settlement => ({
        from: settlement.fromName,
        to: settlement.toName,
        amount: settlement.amountCents / 100,
        isPaid: settlement.isPaid
      })),
      summary: {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, exp) => sum + exp.amountCents, 0) / 100,
        unpaidSettlements: settlements.filter(s => !s.isPaid).length,
        totalUnpaid: settlements.filter(s => !s.isPaid).reduce((sum, s) => sum + s.amountCents, 0) / 100
      }
    };

    // For now, return JSON data instead of actual PDF
    // TODO: Implement actual PDF generation using @react-pdf/renderer
    return NextResponse.json({
      success: true,
      pdfData: pdfContent,
      message: 'PDF generation not yet implemented - returning structured data'
    });

  } catch (error) {
    console.error('❌ Failed to generate PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
