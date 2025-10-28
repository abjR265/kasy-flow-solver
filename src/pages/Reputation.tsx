import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/stores/useStore";
import { Award, TrendingUp, Shield } from "lucide-react";

export default function Reputation() {
  const currentUser = useStore((state) => state.currentUser);

  const mockAttestations = [
    {
      id: "att-1",
      type: "on_time_payment",
      dateISO: "2025-10-28T10:00:00Z",
      ref: "3mPq...kL2x",
    },
    {
      id: "att-2",
      type: "on_time_payment",
      dateISO: "2025-10-25T15:30:00Z",
      ref: "7nBr...wM9z",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Reputation</h1>
        <p className="text-muted-foreground">
          Your on-chain credibility and achievements
        </p>
      </div>

      {/* Reputation Score */}
      <Card className="border-2 card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Reputation Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <p className="text-6xl font-bold gradient-text">
              {currentUser?.repScore || 0}
            </p>
            <div className="flex items-center gap-1 text-success mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+5 this month</span>
            </div>
          </div>
          <Progress value={currentUser?.repScore || 0} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Based on payment history, disputes, and community feedback
          </p>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser?.badges && currentUser.badges.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {currentUser.badges.map((badge) => (
                <Card key={badge.code} className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{badge.label}</h4>
                        <p className="text-xs text-muted-foreground">
                          Earned {new Date(badge.earnedAtISO).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Earn badges by settling payments on time and maintaining good standing.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attestations */}
      <Card>
        <CardHeader>
          <CardTitle>On-Chain Attestations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAttestations.map((attestation) => (
              <div
                key={attestation.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="space-y-1">
                  <Badge variant="outline" className="capitalize">
                    {attestation.type.replace(/_/g, " ")}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(attestation.dateISO).toLocaleString()}
                  </p>
                </div>
                {attestation.ref && (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {attestation.ref}
                  </code>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reset Note */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            💡 Reputation scores are recalculated monthly to reflect recent activity
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
