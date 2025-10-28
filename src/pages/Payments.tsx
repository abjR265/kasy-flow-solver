import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/stores/useStore";
import { ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Payments() {
  const payments = useStore((state) => state.payments);
  const expenses = useStore((state) => state.expenses);
  const updatePayment = useStore((state) => state.updatePayment);

  const totalDue = payments
    .filter((p) => p.status === "unpaid" && p.from.id === "user-1")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const totalOwed = payments
    .filter((p) => p.status === "unpaid" && p.to.id === "user-1")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const handlePay = (paymentId: string, method: string) => {
    toast.success(`Opening ${method}...`);
    setTimeout(() => {
      updatePayment(paymentId, { status: "processing" });
      toast.info("Payment processing...");
    }, 1000);
  };

  const handleMarkPaid = (paymentId: string) => {
    updatePayment(paymentId, { status: "paid", solanaTx: "mock...tx" });
    toast.success("Payment marked as paid!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          Manage outstanding payments and settlement history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              You Owe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              ${(totalDue / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Owed to You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              ${(totalOwed / 100).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Expense</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const expense = expenses.find((e) => e.id === payment.expenseId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={payment.from.avatarUrl} />
                          <AvatarFallback>
                            {payment.from.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{payment.from.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={payment.to.avatarUrl} />
                          <AvatarFallback>
                            {payment.to.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{payment.to.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {expense?.merchant || expense?.description}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${(payment.amountCents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "paid"
                            ? "default"
                            : payment.status === "processing"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === "unpaid" && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handlePay(payment.id, payment.method)}
                          >
                            Pay Now
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkPaid(payment.id)}
                          >
                            Mark Paid
                          </Button>
                        </div>
                      )}
                      {payment.solanaTx && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            window.open(
                              `https://solscan.io/tx/${payment.solanaTx}`,
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
