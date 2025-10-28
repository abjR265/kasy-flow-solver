import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/payments/create - Create payment request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      expenseId,
      fromUserId,
      toUserId,
      amountCents,
      method = 'venmo'
    } = body;

    if (!expenseId || !fromUserId || !toUserId || !amountCents) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    console.log('💳 Creating payment request:', fromUserId, '->', toUserId, amountCents);

    // Get payment profiles for link generation
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { venmo: true, paypal: true, displayName: true }
    });

    const fromUser = await prisma.user.findUnique({
      where: { id: fromUserId },
      select: { displayName: true }
    });

    if (!toUser || !fromUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    const amount = amountCents / 100;
    const venmoHandle = toUser.venmo || toUser.displayName.replace(/\s+/g, '');
    const paypalHandle = toUser.paypal || toUser.displayName.replace(/\s+/g, '');

    const payment = await prisma.payment.create({
      data: {
        expenseId,
        fromUserId,
        toUserId,
        amountCents,
        method,
        status: 'unpaid',
        venmoLink: `https://venmo.com/${venmoHandle}?txn=pay&amount=${amount}&note=Group%20expense%20settlement`,
        paypalLink: `https://paypal.me/${paypalHandle}/${amount}`
      },
      include: {
        fromUser: { select: { displayName: true } },
        toUser: { select: { displayName: true } },
        expense: { select: { description: true, groupId: true } }
      }
    });

    console.log('✅ Payment request created:', payment.id);

    return NextResponse.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('❌ Failed to create payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

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
