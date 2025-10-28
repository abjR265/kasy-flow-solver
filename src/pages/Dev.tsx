import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Copy, Key, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Dev() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const quickStartCode = `import { settleExpense } from "@kasy/settle";

// Settle an expense programmatically
await settleExpense("Bounty Payout", 300, ["@alice", "@bob"]);

// Parse natural language
const expense = await parseExpense("Dinner $60 split with @alice");

// Mint receipt NFT
const nft = await mintReceiptNFT(expenseId);`;

  const restEndpoints = [
    {
      method: "POST",
      path: "/api/v1/expenses",
      description: "Create a new expense",
    },
    {
      method: "GET",
      path: "/api/v1/expenses/:id",
      description: "Get expense details",
    },
    {
      method: "POST",
      path: "/api/v1/payments/solana",
      description: "Generate Solana Pay URL",
    },
    {
      method: "POST",
      path: "/api/v1/receipts/mint",
      description: "Mint compressed NFT receipt",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Developer Portal</h1>
        <p className="text-muted-foreground">
          Build expense settlement into your app with the KASY SDK
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <p className="text-3xl font-bold gradient-text">TypeScript</p>
            <p className="text-sm text-muted-foreground">Primary SDK</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <p className="text-3xl font-bold gradient-text">REST</p>
            <p className="text-sm text-muted-foreground">API Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center space-y-1">
            <p className="text-3xl font-bold gradient-text">Webhooks</p>
            <p className="text-sm text-muted-foreground">Event Driven</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="quickstart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="endpoints">REST API</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="quickstart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Installation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>npm install @kasy/settle</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy("npm install @kasy/settle")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{quickStartCode}</code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopy(quickStartCode)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium">Devnet & Testnet Available</h4>
                <p className="text-sm text-muted-foreground">
                  Test your integration on Solana Devnet before going to mainnet. Toggle networks in your API configuration.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>REST Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {restEndpoints.map((endpoint, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {endpoint.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono">expense.created</span>
                  <Badge variant="secondary">Event</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono">payment.completed</span>
                  <Badge variant="secondary">Event</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span className="font-mono">receipt.minted</span>
                  <Badge variant="secondary">Event</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate and manage API keys for programmatic access to KASY.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Development Key</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      kasy_test_...mock
                    </code>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>

              <Button className="w-full gap-2">
                <Key className="w-4 h-4" />
                Generate New Key
              </Button>

              <Card className="bg-warning/10 border-warning/20">
                <CardContent className="p-3 text-sm">
                  ⚠️ Keep your API keys secure. Never commit them to version control.
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
