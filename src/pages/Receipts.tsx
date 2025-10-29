import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores/useStore";
import { Download, FileText } from "lucide-react";
import { ExpenseCard } from "@/components/ExpenseCard";
import { toast } from "sonner";

export default function Receipts() {
  const expenses = useStore((state) => state.expenses);

  const handleExportPDF = async () => {
    try {
      toast.loading("Generating PDF export...");
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/exports/pdf/group-1`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kasy-receipts-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success("PDF exported successfully!", {
        description: a.download,
      });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.dismiss();
      toast.error("Failed to export PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Receipts</h1>
          <p className="text-muted-foreground">
            Ledger of all expenses and settlements
          </p>
        </div>
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {expenses.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No receipts yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your expense receipts will appear here. Start splitting expenses to build your ledger.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
