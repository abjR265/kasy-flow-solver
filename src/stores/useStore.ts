import { create } from "zustand";
import { User, Group, Expense, PaymentRequest, Vault, ChatMessage } from "@/types";
import { mockUsers, getCurrentUser } from "@/lib/fixtures/users";
import { mockGroups } from "@/lib/fixtures/groups";
import { mockExpenses } from "@/lib/fixtures/expenses";
import { mockPayments } from "@/lib/fixtures/payments";
import { mockVaults } from "@/lib/fixtures/vaults";

type Store = {
  // User
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // Groups
  groups: Group[];
  activeGroupId: string | null;
  setActiveGroupId: (id: string) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;

  // Payments
  payments: PaymentRequest[];
  updatePayment: (id: string, updates: Partial<PaymentRequest>) => void;

  // Vaults
  vaults: Vault[];
  updateVault: (id: string, updates: Partial<Vault>) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
};

export const useStore = create<Store>((set) => ({
  // User
  currentUser: getCurrentUser(),
  setCurrentUser: (user) => set({ currentUser: user }),

  // Groups
  groups: mockGroups,
  activeGroupId: mockGroups[0]?.id || null,
  setActiveGroupId: (id) => set({ activeGroupId: id }),

  // Expenses
  expenses: mockExpenses,
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  // Payments
  payments: mockPayments,
  updatePayment: (id, updates) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  // Vaults
  vaults: mockVaults,
  updateVault: (id, updates) =>
    set((state) => ({
      vaults: state.vaults.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),

  // Chat
  chatMessages: [],
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),
}));
