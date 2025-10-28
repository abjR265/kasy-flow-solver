import { Vault, AutoPayRule, YieldStrategy, VaultTx } from "@/types";
import { mockUserRefs } from "./users";

const mockAutoPayRules: AutoPayRule[] = [
  {
    id: "rule-1",
    title: "Monthly Rent",
    schedule: "monthly",
    amountUSDC: 2000,
    nextRunISO: "2025-11-01T00:00:00Z",
    enabled: true,
  },
  {
    id: "rule-2",
    title: "Weekly Utilities",
    schedule: "weekly",
    amountUSDC: 150,
    nextRunISO: "2025-11-03T00:00:00Z",
    enabled: true,
  },
];

const mockYieldStrategy: YieldStrategy = {
  protocol: "Kamino",
  asset: "stUSDC",
  apy: 0.041,
  allocatedUSDC: 1000,
};

const mockVaultHistory: VaultTx[] = [
  {
    id: "vtx-1",
    dateISO: "2025-10-28T10:00:00Z",
    type: "deposit",
    amountUSDC: 3000,
    counterparty: "@alice",
    solanaTx: "3mPq...kL2x",
  },
  {
    id: "vtx-2",
    dateISO: "2025-10-27T15:30:00Z",
    type: "autopay",
    amountUSDC: -150,
    counterparty: "Weekly Utilities",
    solanaTx: "7nBr...wM9z",
  },
  {
    id: "vtx-3",
    dateISO: "2025-10-26T08:00:00Z",
    type: "yieldEarned",
    amountUSDC: 3.42,
    counterparty: "Kamino stUSDC",
  },
];

export const mockVaults: Vault[] = [
  {
    id: "vault-1",
    groupId: "group-1",
    name: "Room 4A Shared Expenses",
    balanceUSDC: 4853.42,
    members: [mockUserRefs[0], mockUserRefs[1], mockUserRefs[2]],
    autoPayRules: mockAutoPayRules,
    yieldStrategy: mockYieldStrategy,
    history: mockVaultHistory,
  },
];
