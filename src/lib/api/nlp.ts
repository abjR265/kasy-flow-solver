import { ParsedExpense } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Real NLP parser - calls backend API
export async function parseNaturalLanguage(text: string): Promise<ParsedExpense | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.parsed) {
      return null;
    }

    const parsed = data.parsed;
    
    return {
      description: parsed.description || 'Expense',
      amountCents: parsed.amount ? Math.round(parsed.amount * 100) : 0,
      currency: "USD",
      payer: parsed.payer || "@alice", // Current user
      participants: parsed.beneficiaries || ["@alice"],
      confidence: parsed.confidence || 0.5,
    };
  } catch (error) {
    console.error('Failed to parse natural language:', error);
    
    // Fallback to simple pattern matching
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
}
