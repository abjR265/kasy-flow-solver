import { Vault, YieldStrategy } from "@/types";

export async function depositToVault(
  vaultId: string,
  amountUSDC: number
): Promise<{ success: boolean; txHash: string }> {
  await new Promise(r => setTimeout(r, 700));
  
  return {
    success: true,
    txHash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
  };
}

export async function runAutoPay(
  ruleId: string
): Promise<{ success: boolean; txHash: string }> {
  await new Promise(r => setTimeout(r, 600));
  
  return {
    success: true,
    txHash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
  };
}

export async function suggestYieldStrategy(): Promise<YieldStrategy> {
  await new Promise(r => setTimeout(r, 500));
  
  // Mock Kamino strategy
  return {
    protocol: "Kamino",
    asset: "stUSDC",
    apy: 0.041, // 4.1%
    allocatedUSDC: 0, // Not yet allocated
  };
}

export async function applyYieldStrategy(
  vaultId: string,
  strategy: YieldStrategy,
  amountUSDC: number
): Promise<{ success: boolean; txHash: string }> {
  await new Promise(r => setTimeout(r, 800));
  
  return {
    success: true,
    txHash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
  };
}
