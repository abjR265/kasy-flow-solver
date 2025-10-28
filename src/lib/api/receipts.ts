import { Expense } from "@/types";

export type NFTMetadata = {
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
};

// Mock compressed NFT minting - TODO(wire backend)
export async function mintCompressedNFT(expense: Expense): Promise<{
  mint: string;
  solscanUrl: string;
  metadata: NFTMetadata;
}> {
  await new Promise(r => setTimeout(r, 1000));

  const mint = `${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toLowerCase()}`;
  
  const metadata: NFTMetadata = {
    name: `KASY Receipt - ${expense.merchant || expense.description}`,
    description: `On-chain receipt for ${expense.description}`,
    image: expense.receiptImageUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
    attributes: [
      { trait_type: "Merchant", value: expense.merchant || "Unknown" },
      { trait_type: "Amount", value: `$${(expense.amountCents / 100).toFixed(2)}` },
      { trait_type: "Date", value: new Date(expense.dateISO).toLocaleDateString() },
      { trait_type: "Participants", value: expense.participants.length },
      { trait_type: "Currency", value: expense.currency },
    ],
  };

  return {
    mint,
    solscanUrl: `https://solscan.io/token/${mint}?cluster=devnet`,
    metadata,
  };
}

export async function exportReceiptsPDF(expenseIds: string[]): Promise<{ filename: string; url: string }> {
  await new Promise(r => setTimeout(r, 800));
  
  return {
    filename: `kasy-receipts-${new Date().toISOString().split('T')[0]}.pdf`,
    url: "#", // Mock URL
  };
}
