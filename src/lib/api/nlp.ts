import { ParsedExpense } from "@/types";

// Mock NLP parser - TODO(wire backend)
export async function parseNaturalLanguage(text: string): Promise<ParsedExpense | null> {
  await new Promise(r => setTimeout(r, 400));

  // Simple pattern matching for demo
  const amountMatch = text.match(/\$(\d+(?:\.\d{2})?)/);
  const mentionMatches = text.match(/@\w+/g);
  
  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1]);
  const participants = mentionMatches || [];

  // Extract description
  let description = text
    .replace(/\$\d+(?:\.\d{2})?/, '')
    .replace(/@\w+/g, '')
    .replace(/\b(split|with|for|at)\b/gi, '')
    .trim();

  if (!description) description = "Expense";

  return {
    description,
    amountCents: Math.round(amount * 100),
    currency: "USD",
    payer: "@alice", // Current user
    participants: participants.length > 0 ? participants : ["@alice"],
    confidence: 0.92,
  };
}
