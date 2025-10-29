import { NextRequest, NextResponse } from 'next/server';
import { processReceiptOCR } from '@/lib/openai';
import prisma from '@/lib/prisma';

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

// POST /api/receipts/ocr - Smart OCR Receipt Processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, userId, groupId } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400, headers: corsHeaders });
    }

    console.log('🔍 Processing receipt OCR for user:', userId);

    // Process OCR using GPT-4o Vision
    const ocrResult = await processReceiptOCR(imageUrl);

    // Store pending receipt in database (5-minute TTL)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    const pendingReceipt = await prisma.pendingReceipt.create({
      data: {
        userId: userId || 'anonymous',
        userName: 'User', // Will be updated with real name
        groupId: groupId || 'default',
        imageUrl,
        ocrResult: ocrResult as any,
        totalCents: Math.round((ocrResult.total || 0) * 100),
        merchant: ocrResult.merchant || 'Unknown Merchant',
        expiresAt
      }
    });

    console.log('✅ Pending receipt stored:', pendingReceipt.id);

    return NextResponse.json({
      success: true,
      receiptId: pendingReceipt.id,
      ocrResult,
      expiresAt: expiresAt.toISOString()
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ OCR processing failed:', error);
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500, headers: corsHeaders }
    );
  }
}
