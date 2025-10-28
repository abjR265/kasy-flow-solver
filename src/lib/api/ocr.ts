import { ParsedExpense } from "@/types";

export type OCRResult = {
  merchant?: string;
  total?: number;
  tax?: number;
  tip?: number;
  date?: string;
  items?: Array<{ name: string; price: number }>;
  confidence: number;
  suggestedParticipants?: string[];
};

// Mock OCR extraction - TODO(wire backend)
export async function extractReceiptData(imageUrl: string): Promise<OCRResult> {
  await new Promise(r => setTimeout(r, 800));

  // Mock result
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
