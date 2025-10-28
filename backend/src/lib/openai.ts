import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// OCR Constants from KASY_MVP
const OCR_CONFIDENCE_THRESHOLD = 0.7;
const SUSPICIOUS_AMOUNT_THRESHOLD = 5000; // Flag amounts over $5000 for review
const EXTREME_VALUE_THRESHOLD = 99999;

export interface OCRResult {
  merchant?: string;
  total?: number;
  tax?: number;
  tip?: number;
  service_fee?: number;
  date?: string;
  items?: Array<{ name: string; price: number }>;
  confidence: number;
  suggestedParticipants?: string[];
}

// OCR Receipt Processing using GPT-4o Vision (adapted from KASY_MVP lines 3125-3370)
export async function processReceiptOCR(imageUrl: string): Promise<OCRResult> {
  try {
    console.log('🔍 Starting OCR processing...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert at reading receipts and extracting structured data. Extract the following information from the receipt image:

1. **merchant**: The business name (e.g., "Blue Bottle Coffee", "Whole Foods")
2. **total**: The total amount paid (as a number, e.g., 24.50 for $24.50)
3. **tax**: Tax amount (as a number, e.g., 2.20 for $2.20)
4. **tip**: Tip amount (as a number, e.g., 4.30 for $4.30)
5. **service_fee**: Service fee amount (as a number)
6. **date**: The date in YYYY-MM-DD format
7. **items**: Array of items with name and price: [{"name": "Latte", "price": 5.50}, {"name": "Cappuccino", "price": 5.00}]
8. **confidence**: Your confidence in the extraction (0.0 to 1.0)

Return ONLY valid JSON with these exact field names. If a field is not found, omit it or use null.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract receipt data from this image:'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const ocrData = JSON.parse(content);
    console.log('📄 OCR Result:', ocrData);

    // Validate confidence threshold
    if (ocrData.confidence < OCR_CONFIDENCE_THRESHOLD) {
      console.log(`⚠️ Low confidence OCR result: ${ocrData.confidence}`);
    }

    // Flag suspicious amounts
    if (ocrData.total && ocrData.total > SUSPICIOUS_AMOUNT_THRESHOLD) {
      console.log(`🚨 Suspicious amount detected: $${ocrData.total}`);
    }

    return {
      merchant: ocrData.merchant,
      total: ocrData.total,
      tax: ocrData.tax,
      tip: ocrData.tip,
      service_fee: ocrData.service_fee,
      date: ocrData.date,
      items: ocrData.items,
      confidence: ocrData.confidence || 0.5,
      suggestedParticipants: []
    };

  } catch (error) {
    console.error('❌ OCR processing failed:', error);
    throw new Error('Failed to process receipt image');
  }
}

// Natural Language Parsing using GPT-4o-mini (adapted from KASY_MVP lines 570-626)
export async function parseExpenseTextWithAI(text: string): Promise<{
  amount?: number;
  description?: string;
  confidence: number;
  beneficiaries?: string[];
  payer?: string;
}> {
  try {
    console.log('🤖 Parsing expense text with AI:', text);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that extracts expense information from text. Extract the amount (just the number) and a SHORT 1-2 word description of what the expense was for (e.g., "lunch", "coffee", "dinner", "uber", "groceries"). 

Also identify:
- The payer (who paid for the expense)
- The beneficiaries (who should split the cost)

Return JSON with fields: amount (number), description (string), payer (string), beneficiaries (array of strings), confidence (0.0-1.0).`
        },
        {
          role: 'user',
          content: `Extract the amount, description, payer, and beneficiaries from: "${text}"`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content);
    console.log('🤖 AI parsed:', parsed);

    return {
      amount: parsed.amount ? parseFloat(parsed.amount.toString()) : undefined,
      description: parsed.description || 'Expense',
      confidence: parsed.confidence || 0.95,
      beneficiaries: parsed.beneficiaries || [],
      payer: parsed.payer
    };

  } catch (error) {
    console.error('❌ AI parsing failed:', error);
    throw new Error('Failed to parse expense text');
  }
}

// Overlapping Splits Parsing (adapted from KASY_MVP lines 628-851)
export async function parseOverlappingSplits(
  text: string,
  totalCents: number
): Promise<{
  isOverlapping: boolean;
  splitGroups?: Array<{
    name: string;
    participants: string[];
    totalCents: number;
    perPersonCents: number;
  }>;
}> {
  // Detect overlapping patterns
  const hasHalvesPattern = (
    /split\s+(?:this|the|into)?\s*(?:into|in)?\s+(two|2|three|3)\s+(?:halves?|groups?|ways?)/i.test(text) ||
    /(?:divided?|split)\s+in\s+half/i.test(text) ||
    /(?:half|group)\s*(?:1|2|one|two|first|second|a|b)/i.test(text) ||
    /\bh[12]\b/i.test(text) ||
    (text.match(/(?:half|group|h\d)/gi) || []).length >= 2
  );

  if (!hasHalvesPattern) {
    return { isOverlapping: false };
  }

  console.log('🔍 Detected overlapping split pattern!');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are parsing an expense split into overlapping groups where participants may appear in multiple groups.

CRITICAL: PRESERVE EXACT CAPITALIZATION of participant names as typed by user!
- If user types "TOM", output "TOM" (not "tom")
- If user types "Jerry", output "Jerry" (not "jerry")
- DO NOT normalize to lowercase or titlecase

IMPORTANT: Accept MANY variations of how users describe groups:
- "Half 1", "Half 2" OR "half one", "half two"
- "first group", "second group" OR "first half", "second half"
- "Group A", "Group B" OR "group a", "group b"
- "h1", "h2" (abbreviated)
- "first group was", "second group was"

Extract the groups and their participants. Return JSON:
{
  "groups": [
    {
      "name": "Group identifier",
      "participants": ["Name1", "Name2", ...]
    }
  ]
}

EXAMPLES:

Input: "Half 1: Boom Ken Jessi. Half 2: Boom Ann Gil"
Output: {"groups": [{"name": "Half 1", "participants": ["Boom", "Ken", "Jessi"]}, {"name": "Half 2", "participants": ["Boom", "Ann", "Gil"]}]}

Input: "first group was me sarah john, second group was me ann bob"
Output: {"groups": [{"name": "first group", "participants": ["me", "sarah", "john"]}, {"name": "second group", "participants": ["me", "ann", "bob"]}]}`
        },
        {
          role: 'user',
          content: `Parse this overlapping split: "${text}"`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content);
    console.log('🔍 Parsed overlapping groups:', parsed);

    if (!parsed.groups || parsed.groups.length < 2) {
      return { isOverlapping: false };
    }

    // Calculate per-group amounts
    const numGroups = parsed.groups.length;
    const perGroupCents = Math.floor(totalCents / numGroups);
    const remainder = totalCents - (perGroupCents * numGroups);

    const splitGroups = parsed.groups.map((group: any, index: number) => {
      const groupTotalCents = perGroupCents + (index === 0 ? remainder : 0);
      const perPersonCents = Math.floor(groupTotalCents / group.participants.length);

      return {
        name: group.name,
        participants: group.participants,
        totalCents: groupTotalCents,
        perPersonCents
      };
    });

    return {
      isOverlapping: true,
      splitGroups
    };

  } catch (error) {
    console.error('❌ Overlapping split parsing failed:', error);
    return { isOverlapping: false };
  }
}

export { OCR_CONFIDENCE_THRESHOLD, SUSPICIOUS_AMOUNT_THRESHOLD, EXTREME_VALUE_THRESHOLD };
