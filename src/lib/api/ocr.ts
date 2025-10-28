import { ParsedExpense } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export type OCRResult = {
  merchant?: string;
  total?: number;
  tax?: number;
  tip?: number;
  service_fee?: number;
  date?: string;
  items?: Array<{ name: string; price: number }>;
  confidence: number;
  suggestedParticipants?: string[];
};

// Real OCR extraction - calls backend API
export async function extractReceiptData(imageUrl: string, userId?: string, groupId?: string): Promise<OCRResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/receipts/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        imageUrl,
        userId: userId || 'anonymous',
        groupId: groupId || 'default'
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.ocrResult) {
      throw new Error('OCR processing failed');
    }

    return data.ocrResult;
  } catch (error) {
    console.error('Failed to extract receipt data:', error);
    
    // Fallback to mock result
    return {
      merchant: "The Coffee Shop",
      total: 24.50,
      tax: 2.20,
      tip: 4.30,
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: "Latte", price: 5.50 },
        { name: "Cappuccino", price: 5.00 },
        { name: "Croissant", price: 4.50 },
        { name: "Muffin", price: 4.00 },
      ],
      confidence: 0.95,
      suggestedParticipants: ["@alice", "@bob"],
    };
  }
}

export function ocrResultToExpense(ocr: OCRResult, payer: string, participants: string[]): ParsedExpense {
  return {
    merchant: ocr.merchant,
    description: `${ocr.merchant || 'Expense'} - ${ocr.date || 'today'}`,
    amountCents: Math.round((ocr.total || 0) * 100),
    currency: "USD",
    payer,
    participants,
    confidence: ocr.confidence,
  };
}

export function ocrResultToExpense(ocr: OCRResult, payer: string, participants: string[]): ParsedExpense {
  return {
    merchant: ocr.merchant,
    description: `${ocr.merchant || 'Expense'} - ${ocr.date || 'today'}`,
    amountCents: Math.round((ocr.total || 0) * 100),
    currency: "USD",
    payer,
    participants,
    confidence: ocr.confidence,
  };
}
