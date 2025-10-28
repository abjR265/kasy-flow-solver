import { Expense, PaymentRequest } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Expense API functions
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
    return data.success ? data.expense : null;
  } catch (error) {
    console.error('Failed to create expense:', error);
    return null;
  }
}

export async function getExpenses(groupId: string): Promise<Expense[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses?groupId=${groupId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.expenses : [];
  } catch (error) {
    console.error('Failed to get expenses:', error);
    return [];
  }
}

export async function updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.expense : null;
  } catch (error) {
    console.error('Failed to update expense:', error);
    return null;
  }
}

export async function deleteExpense(expenseId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return false;
  }
}

// Settlement API functions
export async function getSettlements(groupId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settlements/${groupId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Failed to get settlements:', error);
    return null;
  }
}

// Payment API functions
export async function createPayment(paymentData: {
  expenseId: string;
  fromUserId: string;
  toUserId: string;
  amountCents: number;
  method?: string;
}): Promise<PaymentRequest | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.payment : null;
  } catch (error) {
    console.error('Failed to create payment:', error);
    return null;
  }
}

export async function markPaymentPaid(paymentId: string, markedBy: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/mark-paid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId, markedBy }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to mark payment as paid:', error);
    return false;
  }
}

export async function getPaymentProfile(userId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/profile/${userId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.profile : null;
  } catch (error) {
    console.error('Failed to get payment profile:', error);
    return null;
  }
}

export async function updatePaymentProfile(userId: string, profile: { venmo?: string; paypal?: string }): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/payments/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Failed to update payment profile:', error);
    return false;
  }
}

// Badge API functions
export async function getUserBadges(userId: string, groupId?: string): Promise<any[]> {
  try {
    const url = groupId 
      ? `${API_BASE_URL}/api/badges/${userId}?groupId=${groupId}`
      : `${API_BASE_URL}/api/badges/${userId}`;
      
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.badges : [];
  } catch (error) {
    console.error('Failed to get user badges:', error);
    return [];
  }
}

// PDF Export API function
export async function exportGroupPDF(groupId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/exports/pdf/${groupId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.success ? data.pdfData : null;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    return null;
  }
}
