import { NextRequest, NextResponse } from 'next/server';
import { parseOverlappingSplits } from '@/lib/openai';

// POST /api/expenses/overlapping - Overlapping Splits Calculation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, totalCents } = body;

    if (!text || !totalCents) {
      return NextResponse.json({ 
        error: 'Text and totalCents are required' 
      }, { status: 400 });
    }

    console.log('🔍 Processing overlapping splits:', text, totalCents);

    // Parse overlapping splits
    const result = await parseOverlappingSplits(text, totalCents);

    if (!result.isOverlapping) {
      return NextResponse.json({
        success: true,
        isOverlapping: false,
        message: 'No overlapping split pattern detected'
      });
    }

    // Calculate overlapping user breakdown
    const overlappingUsers: Record<string, { groups: string[], totalCents: number }> = {};
    
    for (const group of result.splitGroups || []) {
      for (const participant of group.participants) {
        if (!overlappingUsers[participant]) {
          overlappingUsers[participant] = {
            groups: [],
            totalCents: 0
          };
        }
        overlappingUsers[participant].groups.push(group.name);
        overlappingUsers[participant].totalCents += group.perPersonCents;
      }
    }

    return NextResponse.json({
      success: true,
      isOverlapping: true,
      splitGroups: result.splitGroups,
      overlappingUsers,
      summary: {
        totalGroups: result.splitGroups?.length || 0,
        overlappingCount: Object.keys(overlappingUsers).length,
        totalAmount: totalCents
      }
    });

  } catch (error) {
    console.error('❌ Overlapping splits calculation failed:', error);
    return NextResponse.json(
      { error: 'Failed to calculate overlapping splits' },
      { status: 500 }
    );
  }
}
