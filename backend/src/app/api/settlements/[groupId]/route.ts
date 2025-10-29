import { NextRequest, NextResponse } from 'next/server';
import { calculateBalances, calculateSettlements } from '@/lib/calculations';

// GET /api/settlements/[groupId] - Get settlements for group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;

    console.log('💰 Calculating settlements for group:', groupId);

    // Calculate balances from all expenses
    const balances = await calculateBalances(groupId);

    // Calculate optimized settlements
    const settlements = await calculateSettlements(balances, groupId);

    // Calculate summary
    const totalOwed = balances
      .filter(b => b.balance > 0)
      .reduce((sum, b) => sum + b.balance, 0);
    
    const totalDebt = balances
      .filter(b => b.balance < 0)
      .reduce((sum, b) => sum + Math.abs(b.balance), 0);

    const unpaidSettlements = settlements.filter(s => !s.isPaid);
    const paidSettlements = settlements.filter(s => s.isPaid);

    return NextResponse.json({
      success: true,
      balances,
      settlements,
      summary: {
        totalOwed,
        totalDebt,
        totalSettlements: settlements.length,
        unpaidSettlements: unpaidSettlements.length,
        paidSettlements: paidSettlements.length,
        totalUnpaidAmount: unpaidSettlements.reduce((sum, s) => sum + s.amountCents, 0)
      }
    });

  } catch (error) {
    console.error('❌ Failed to calculate settlements:', error);
    return NextResponse.json(
      { error: 'Failed to calculate settlements' },
      { status: 500 }
    );
  }
}
