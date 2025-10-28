// Mock payment service - TODO(wire backend)

export type PaymentMethod = "venmo" | "paypal" | "solana";

export async function generateVenmoLink(
  recipient: string,
  amount: number,
  note: string
): Promise<string> {
  await new Promise(r => setTimeout(r, 200));
  const venmoHandle = recipient.replace('@', '');
  return `https://venmo.com/?txn=pay&recipients=${venmoHandle}&amount=${(amount / 100).toFixed(2)}&note=${encodeURIComponent(note)}`;
}

export async function generatePayPalLink(
  recipientEmail: string,
  amount: number,
  note: string
): Promise<string> {
  await new Promise(r => setTimeout(r, 200));
  return `https://www.paypal.me/${recipientEmail}/${(amount / 100).toFixed(2)}`;
}

export async function generateSolanaPayUrl(
  recipientAddress: string,
  amountUSDC: number,
  label: string,
  message: string
): Promise<string> {
  await new Promise(r => setTimeout(r, 200));
  const params = new URLSearchParams({
    amount: (amountUSDC / 100).toFixed(2),
    recipient: recipientAddress,
    label,
    message,
  });
  return `solana:https://pay.kasy.dev/?${params.toString()}`;
}

export async function markPaymentPaid(paymentId: string): Promise<{ success: boolean; txHash?: string }> {
  await new Promise(r => setTimeout(r, 500));
  return {
    success: true,
    txHash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
  };
}
