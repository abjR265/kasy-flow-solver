import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/payments/mark-paid - Mark payment as paid
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, markedBy } = body;

    if (!paymentId) {
      return NextResponse.json({ 
        error: 'paymentId is required' 
      }, { status: 400 });
    }

    console.log('✅ Marking payment as paid:', paymentId);

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'paid',
        paidAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        expense: {
          include: {
            group: true
          }
        }
      }
    });

    // Check for badge eligibility
    if (payment.expense) {
      // Import badge functions
      const { checkTableHeroBadge, checkPayItForwardBadge } = await import('@/lib/badges');
      
      // Check Table Hero badge for creditor
      await checkTableHeroBadge(
        payment.expense.groupId,
        payment.toUserId,
        payment.fromUserId,
        payment.expense.createdAt.toISOString()
      );

      // Check Pay It Forward badge for debtor
      await checkPayItForwardBadge(
        payment.expense.groupId,
        payment.fromUserId,
        new Date().toISOString(),
        payment.expense.createdAt.toISOString()
      );
    }

    console.log('✅ Payment marked as paid:', payment.id);

    return NextResponse.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('❌ Failed to mark payment as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark payment as paid' },
      { status: 500 }
    );
  }
}
