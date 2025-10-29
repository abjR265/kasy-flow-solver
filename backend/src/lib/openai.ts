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

// OCR Receipt Processing using GPT-4o Vision (EXACT copy from KASY_MVP lines 867-987)
export async function processReceiptOCR(imageUrl: string): Promise<OCRResult> {
  const startTime = Date.now();
  try {
    console.log('🔍 Starting OCR processing...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a HIGHLY ACCURATE receipt OCR system. Extract the following information with EXTREME PRECISION:

**CRITICAL - NUMBER ACCURACY:**
The "total" field is THE MOST IMPORTANT. You MUST transcribe it with 100% accuracy.
- Look for the final total at the bottom of the receipt (often labeled "Total", "Amount", "Grand Total")
- Read EACH DIGIT carefully - verify twice before returning
- Pay EXTREME attention to similar-looking digits:
  • 2 vs 7 (very common confusion!)
  • 0 vs 8
  • 1 vs 7
  • 3 vs 8
  • 5 vs 6
- If you see "2,377.54" or "2377.54", transcribe EXACTLY as 2377.54
- If you see "2,277.54", that's DIFFERENT from "2,377.54" - be precise!

**EXTRACT:**
1. Merchant/Business name (usually at the top)
2. Date of transaction (any date format)
3. Subtotal amount (before any fees/tax/tip)
4. Service fees, delivery fees, convenience fees (if any)
5. Tax amount (if shown separately)
6. Tip amount (if shown separately)
7. **Total amount (FINAL AMOUNT PAID - VERIFY THIS TWICE!)**

**Return ONLY valid JSON:**
{
  "merchant": "business name or null",
  "date": "YYYY-MM-DD or null", 
  "subtotal": number_or_null,
  "service_fee": number_or_null,
  "tax": number_or_null,
  "tip": number_or_null,
  "total": number_or_null,
  "confidence": 0.0-1.0
}

**Set confidence honestly:**
- 0.95+ ONLY if you are CERTAIN about the total (all digits clearly visible)
- 0.85-0.94 if total is likely correct but one digit might be ambiguous
- 0.7-0.84 if some uncertainty about numbers
- 0.5-0.69 if numbers are hard to read
- Below 0.5 if image quality is poor

**IF UNCERTAIN ABOUT THE TOTAL:** Set confidence below 0.9 so the user can verify it!`
          },
          {
            type: 'image_url',
            image_url: { 
              url: imageUrl,
              detail: 'high'
            }
          }
        ]
      }],
      max_tokens: 300
    });

    const processingTime = Date.now() - startTime;
    console.log(`🔍 OCR processing time: ${processingTime}ms`);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ No content returned from OpenAI');
      return { confidence: 0.2, suggestedParticipants: [] } as OCRResult;
    }

    console.log(`🔍 OCR raw response: ${content}`);
    
    try {
      // Clean the response in case it has markdown formatting
      const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      const result: OCRResult = {
        merchant: parsed.merchant || undefined,
        date: parsed.date || undefined,
        total: typeof parsed.total === 'number' ? parsed.total : undefined,
        tax: typeof parsed.tax === 'number' ? parsed.tax : undefined,
        tip: typeof parsed.tip === 'number' ? parsed.tip : undefined,
        service_fee: typeof parsed.service_fee === 'number' ? parsed.service_fee : undefined,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
        suggestedParticipants: []
      };
      
      console.log(`🔍 OCR parsed result:`, result);
      
      // Validate confidence threshold
      if (result.confidence < OCR_CONFIDENCE_THRESHOLD) {
        console.log(`⚠️ Low confidence OCR result: ${result.confidence}`);
      }

      // Flag suspicious amounts
      if (result.total && result.total > SUSPICIOUS_AMOUNT_THRESHOLD) {
        console.log(`🚨 Suspicious amount detected: $${result.total}`);
      }
      
      return result;
    } catch (parseError) {
      console.error('❌ OCR JSON parsing failed:', parseError, 'Raw content:', content);
      return { confidence: 0.3, suggestedParticipants: [] } as OCRResult;
    }

  } catch (error) {
    console.error(`❌ OCR processing failed (${Date.now() - startTime}ms):`, error);
    return { confidence: 0.2, suggestedParticipants: [] } as OCRResult;
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
          content: 'You are a helpful assistant that extracts expense information from text. Extract: 1) amount (number), 2) SHORT 1-2 word description (e.g., "lunch", "coffee", "dinner"), 3) participants mentioned (names after "split with" or "with"). Return JSON with: amount (number), description (string), participants (array of name strings, empty if none mentioned).'
        },
        {
          role: 'user',
          content: `Extract expense info from: "${text}"`
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
      confidence: 0.95,
      beneficiaries: parsed.participants || [],
      payer: undefined
    };

  } catch (error) {
    console.error('❌ AI parsing failed:', error);
    throw new Error('Failed to parse expense text');
  }
}

// Overlapping Splits Parsing (EXACT copy from KASY_MVP lines 629-808)
export async function parseOverlappingSplits(
  text: string,
  totalCents: number
): Promise<{
  isOverlapping: boolean;
  splitGroups?: Array<{
    groupName: string;
    participants: string[];
    participantNames: Record<string, string>;
    totalCents: number;
    perPersonCents: number;
  }>;
}> {
  // Detect overlapping patterns - FLEXIBLE pattern detection
  const hasHalvesPattern = (
    // Pattern 1: "split into X halves/groups/ways"
    /split\s+(?:this|the|into)?\s*(?:into|in)?\s+(two|2|three|3)\s+(?:halves?|groups?|ways?)/i.test(text) ||
    // Pattern 2: "divided/split in half"
    /(?:divided?|split)\s+in\s+half/i.test(text) ||
    // Pattern 3: "half 1/2", "Half one/two", "first/second half/group"
    /(?:half|group)\s*(?:1|2|one|two|first|second|a|b)/i.test(text) ||
    // Pattern 4: Abbreviated "h1", "h2"
    /\bh[12]\b/i.test(text) ||
    // Pattern 5: Multiple instances of group/half indicators
    (text.match(/(?:half|group|h\d)/gi) || []).length >= 2
  );

  if (!hasHalvesPattern) {
    return { isOverlapping: false };
  }

  console.log('🔍 Detected overlapping split pattern!');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
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
Output: {"groups": [{"name": "Group 1", "participants": ["me", "sarah", "john"]}, {"name": "Group 2", "participants": ["me", "ann", "bob"]}]}

Input: "Group A: Alice Bob. Group B: Alice Carol"
Output: {"groups": [{"name": "Group A", "participants": ["Alice", "Bob"]}, {"name": "Group B", "participants": ["Alice", "Carol"]}]}

Input: "HALF 1: tom jerry. half 2: TOM ann"
Output: {"groups": [{"name": "Half 1", "participants": ["tom", "jerry"]}, {"name": "Half 2", "participants": ["TOM", "ann"]}]}

Input: "half one has: Boom Ken Jessi, and then half two has: Boom Ann Gil"
Output: {"groups": [{"name": "Half 1", "participants": ["Boom", "Ken", "Jessi"]}, {"name": "Half 2", "participants": ["Boom", "Ann", "Gil"]}]}`
      }, {
        role: 'user',
        content: `Parse the overlapping groups from: "${text}"`
      }],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content);
    console.log('🤖 OpenAI parsed overlapping groups:', JSON.stringify(parsed));

    if (!parsed.groups || parsed.groups.length === 0) {
      return { isOverlapping: false };
    }

    const numGroups = parsed.groups.length;
    const amountPerGroup = Math.round(totalCents / numGroups);

    // CRITICAL: Create consistent IDs for the same person across all groups (case-insensitive)
    // Step 1: Collect all unique participants (case-insensitive)
    const uniqueParticipantsMap = new Map<string, string>(); // lowercase -> original display name
    parsed.groups.forEach((group: any) => {
      group.participants.forEach((name: string) => {
        const nameLower = name.toLowerCase().trim();
        if (!uniqueParticipantsMap.has(nameLower)) {
          // Keep the first occurrence's capitalization as display name
          uniqueParticipantsMap.set(nameLower, name.trim());
        }
      });
    });

    // Step 2: Create consistent userId for each unique person
    const nameToUserId = new Map<string, string>(); // lowercase name -> userId
    uniqueParticipantsMap.forEach((displayName, nameLower) => {
      // Create synthetic ID based on lowercase name for consistency
      const userId = `split_${nameLower.replace(/\s+/g, '_')}_${Date.now()}`;
      nameToUserId.set(nameLower, userId);
      console.log(`⚠️ Created synthetic ID for "${displayName}": ${userId}`);
    });

    // Step 3: Map groups using consistent IDs BUT preserve exact capitalization per group
    const splitGroups = parsed.groups.map((group: any) => {
      const participants: string[] = [];
      const participantNames: Record<string, string> = {};

      group.participants.forEach((name: string) => {
        const nameLower = name.toLowerCase().trim();
        const userId = nameToUserId.get(nameLower)!;
        const displayName = name.trim(); // Use exact capitalization from this group

        participants.push(userId);
        participantNames[userId] = displayName;
      });

      return {
        groupName: group.name,
        participants,
        participantNames,
        totalCents: amountPerGroup,
        perPersonCents: Math.round(amountPerGroup / participants.length)
      };
    });

    console.log('✅ Parsed split groups:', JSON.stringify(splitGroups, null, 2));

    return {
      isOverlapping: true,
      splitGroups
    };

  } catch (error) {
    console.log('❌ Overlapping split parsing failed:', error);
    return { isOverlapping: false };
  }
}

export { OCR_CONFIDENCE_THRESHOLD, SUSPICIOUS_AMOUNT_THRESHOLD, EXTREME_VALUE_THRESHOLD };
