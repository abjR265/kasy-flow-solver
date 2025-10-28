import { Expense } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Props = {
  expense: Expense;
};

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const },
  partially_paid: { label: "Partially Paid", variant: "default" as const },
  paid: { label: "Paid", variant: "default" as const },
};

export function ExpenseCard({ expense }: Props) {
  const status = statusConfig[expense.status];
  const amount = (expense.amountCents / 100).toFixed(2);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{expense.merchant || expense.description}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
              {expense.nftReceiptMint && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  NFT
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{expense.description}</p>
            <p className="text-lg font-bold">
              {expense.currency === "USDC" ? "◎" : "$"}{amount} {expense.currency}
            </p>
          </div>

          {expense.receiptImageUrl && (
            <img
              src={expense.receiptImageUrl}
              alt="Receipt"
              className="w-20 h-20 object-cover rounded-lg border"
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Paid by:</span>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={expense.payer.avatarUrl} />
              <AvatarFallback>{expense.payer.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{expense.payer.displayName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Split between:</span>
          <div className="flex -space-x-2">
            {expense.participants.map((p) => (
              <Avatar key={p.id} className="w-6 h-6 border-2 border-background">
                <AvatarImage src={p.avatarUrl} />
                <AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            ({expense.participants.length} people)
          </span>
        </div>

        {expense.solanaTx && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => window.open(`https://solscan.io/tx/${expense.solanaTx}`, "_blank")}
          >
            View on Solscan
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}

        {expense.status === "paid" && !expense.nftReceiptMint && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => toast.info("Mint NFT clicked")}
          >
            <Sparkles className="w-4 h-4" />
            Mint Receipt NFT
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
