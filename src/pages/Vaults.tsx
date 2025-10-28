import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/stores/useStore";
import { Plus, TrendingUp, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Vaults() {
  const vaults = useStore((state) => state.vaults);

  if (vaults.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Vaults</h1>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Vault
          </Button>
        </div>

        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Create your first vault</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Vaults automate recurring expenses like rent or utilities with programmable rules and yield strategies.
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Vault
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vault = vaults[0]; // Show first vault for demo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Vaults</h1>
          <p className="text-muted-foreground">
            Programmable group wallets with auto-pay and yield
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Vault
        </Button>
      </div>

      {/* Vault Overview */}
      <Card className="border-2 card-glow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>{vault.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Members:</span>
                <div className="flex -space-x-2">
                  {vault.members.map((member) => (
                    <Avatar key={member.id} className="w-6 h-6 border-2 border-background">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Deposit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-4xl font-bold gradient-text">
              ◎{vault.balanceUSDC.toFixed(2)} USDC
            </p>
          </div>

          {vault.yieldStrategy && (
            <Card className="bg-success/10 border-success/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="font-medium">Earning Yield</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vault.yieldStrategy.protocol} {vault.yieldStrategy.asset} @ {(vault.yieldStrategy.apy * 100).toFixed(2)}% APY
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">
                    ◎{vault.yieldStrategy.allocatedUSDC.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Allocated</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="rules">Auto-Pay Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vault.history.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {tx.type}
                        </Badge>
                        <span className="text-sm font-medium">{tx.counterparty}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.dateISO).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`font-bold ${tx.amountUSDC >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {tx.amountUSDC >= 0 ? '+' : ''}◎{Math.abs(tx.amountUSDC).toFixed(2)}
                      </p>
                      {tx.solanaTx && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://solscan.io/tx/${tx.solanaTx}`, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Auto-Pay Rules</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vault.autoPayRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rule.title}</h4>
                          <Badge variant={rule.enabled ? "default" : "secondary"}>
                            {rule.enabled ? "Active" : "Paused"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="capitalize">{rule.schedule}</span>
                          <span>•</span>
                          <span>Next run: {new Date(rule.nextRunISO).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-lg font-bold">◎{rule.amountUSDC.toFixed(2)}</p>
                        <Button size="sm" variant="outline" onClick={() => toast.info("Run now clicked")}>
                          Run Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
