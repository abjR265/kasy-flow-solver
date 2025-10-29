import { NextRequest, NextResponse } from 'next/server';
import { parseExpenseTextWithAI, parseOverlappingSplits } from '@/lib/openai';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST /api/expenses/parse - Natural Language Parsing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, totalCents } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log('🤖 Parsing expense text:', text);

    // Parse with GPT-4o-mini
    const parsed = await parseExpenseTextWithAI(text);

    // Check for overlapping splits if totalCents is provided
    let overlappingResult = null;
    if (totalCents) {
      overlappingResult = await parseOverlappingSplits(text, totalCents);
    }

    return NextResponse.json({
      success: true,
      parsed: {
        amount: parsed.amount,
        description: parsed.description,
        confidence: parsed.confidence,
        beneficiaries: parsed.beneficiaries,
        payer: parsed.payer
      },
      overlapping: overlappingResult
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ NLP parsing failed:', error);
    return NextResponse.json(
      { error: 'Failed to parse expense text' },
      { status: 500, headers: corsHeaders }
    );
  }
}
