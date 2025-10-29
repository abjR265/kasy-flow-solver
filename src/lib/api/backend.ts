import { Expense } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create expense in backend
export async function createExpense(expenseData: Partial<Expense>): Promise<Expense | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.expense || data;
  } catch (error) {
    console.error('Failed to create expense:', error);
    return null;
  }
}

// Get expenses for a group
export async function getExpenses(groupId: string): Promise<Expense[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses?groupId=${groupId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.expenses || [];
  } catch (error) {
    console.error('Failed to get expenses:', error);
    return [];
  }
}

