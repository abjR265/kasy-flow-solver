import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/expenses/[id] - Edit expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: expenseId } = await params;
    const body = await request.json();
    const {
      merchant,
      description,
      amountCents,
      participants,
      participantNames,
      customShares,
      splitType,
      splitGroups
    } = body;

    console.log('✏️ Editing expense:', expenseId);

    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        merchant,
        description,
        amountCents,
        participants,
        participantNames: participantNames ? participantNames as any : null,
        customShares: customShares ? customShares as any : null,
        splitType,
        splitGroups: splitGroups ? splitGroups as any : null,
        updatedAt: new Date()
      },
      include: {
        payer: true,
        group: true
      }
    });

    console.log('✅ Expense updated:', expense.id);

    return NextResponse.json({
      success: true,
      expense
    });

  } catch (error) {
    console.error('❌ Failed to update expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - Soft delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseId = params.id;

    console.log('🗑️ Soft deleting expense:', expenseId);

    // Soft delete by updating status
    const expense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        status: 'deleted',
        updatedAt: new Date()
      }
    });

    console.log('✅ Expense soft deleted:', expense.id);

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('❌ Failed to delete expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
