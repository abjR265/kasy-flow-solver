export type User = {
  id: string;
  handle: string; // "@alice"
  displayName: string;
  avatarUrl?: string;
  venmo?: string | null;
  paypal?: string | null;
  repScore: number; // 0-100
  badges: Badge[];
};

export type Group = {
  id: string;
  name: string; // "Room 4A", "Sushi Night"
  members: UserRef[];
  vaultId?: string | null;
};

export type UserRef = { 
  id: string; 
  handle: string; 
  displayName: string;
  avatarUrl?: string;
};

export type Expense = {
  id: string;
  groupId: string;
  merchant?: string;
  description: string;
  amountCents: number;
  currency: "USD" | "USDC";
  payer: UserRef;
  participants: UserRef[];
  dateISO: string;
  status: "pending" | "partially_paid" | "paid";
  receiptImageUrl?: string;
  nftReceiptMint?: string | null;
  solanaTx?: string | null;
};

export type PaymentRequest = {
  id: string;
  expenseId: string;
  from: UserRef;
  to: UserRef;
  amountCents: number;
  method: "venmo" | "paypal" | "solana";
  status: "unpaid" | "processing" | "paid";
  solanaPayUrl?: string;
  solanaTx?: string | null;
};

export type Vault = {
  id: string;
  groupId: string;
  name: string;
  balanceUSDC: number;
  members: UserRef[];
  autoPayRules: AutoPayRule[];
  yieldStrategy?: YieldStrategy | null;
  history: VaultTx[];
};

export type AutoPayRule = {
  id: string;
  title: string;
  schedule: "monthly" | "weekly" | "custom";
  amountUSDC: number;
  nextRunISO: string;
  enabled: boolean;
};

export type YieldStrategy = {
  protocol: "Kamino" | "Jito";
  asset: "stUSDC";
  apy: number;
  allocatedUSDC: number;
};

export type VaultTx = {
  id: string;
  dateISO: string;
  type: "deposit" | "withdraw" | "autopay" | "yieldEarned";
  amountUSDC: number;
  counterparty?: string;
  solanaTx?: string;
};

export type Badge = {
  code: "TABLE_HERO" | "PAY_IT_FORWARD" | "EVEN_STEVEN";
  label: string;
  earnedAtISO: string;
};

export type Attestation = {
  id: string;
  userId: string;
  type: "on_time_payment" | "default" | "dispute_resolved";
  dateISO: string;
  ref?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  expense?: Expense;
  actions?: ChatAction[];
};

export type ChatAction = {
  type: "confirm_split" | "pay" | "mint_nft";
  label: string;
  data?: any;
};

export type ParsedExpense = {
  merchant?: string;
  description: string;
  amountCents: number;
  currency: "USD" | "USDC";
  payer: string; // handle
  participants: string[]; // handles
  confidence?: number;
};
