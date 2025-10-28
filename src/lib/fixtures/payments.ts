import { PaymentRequest } from "@/types";
import { mockUserRefs } from "./users";

export const mockPayments: PaymentRequest[] = [
  {
    id: "pay-1",
    expenseId: "exp-2",
    from: mockUserRefs[0],
    to: mockUserRefs[1],
    amountCents: 6167,
    method: "solana",
    status: "unpaid",
    solanaPayUrl: "solana:https://pay.kasy.dev/?amount=61.67&recipient=...",
  },
  {
    id: "pay-2",
    expenseId: "exp-3",
    from: mockUserRefs[0],
    to: mockUserRefs[2],
    amountCents: 4260,
    method: "venmo",
    status: "unpaid",
  },
  {
    id: "pay-3",
    expenseId: "exp-3",
    from: mockUserRefs[1],
    to: mockUserRefs[2],
    amountCents: 4260,
    method: "paypal",
    status: "unpaid",
  },
  {
    id: "pay-4",
    expenseId: "exp-1",
    from: mockUserRefs[1],
    to: mockUserRefs[0],
    amountCents: 817,
    method: "solana",
    status: "paid",
    solanaTx: "5xVqw...mR9p",
  },
];
