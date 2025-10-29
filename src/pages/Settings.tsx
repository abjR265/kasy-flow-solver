import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/stores/useStore";
import { User, CreditCard, Bell, Wallet, Upload } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const currentUser = useStore((state) => state.currentUser);
  const [profile, setProfile] = useState({
    displayName: currentUser?.displayName || "",
    handle: currentUser?.handle || "",
    venmo: currentUser?.venmo || "",
    paypal: currentUser?.paypal || "",
  });

  const [notifications, setNotifications] = useState({
    enableDMs: true,
    quietHours: true,
    escalation: true,
  });

  const handleSaveProfile = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-1', // Current user ID
          displayName: profile.displayName,
          handle: profile.handle,
          venmo: profile.venmo,
          paypal: profile.paypal
        })
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error("Failed to update profile");
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user-1',
          preferences: notifications
        })
      });

      if (response.ok) {
        toast.success("Notification preferences saved!");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error("Failed to save preferences");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentUser?.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {currentUser?.displayName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="w-4 h-4" />
              Change Avatar
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              value={profile.handle}
              onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
              placeholder="@username"
            />
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and underscores only
            </p>
          </div>

          <Button onClick={handleSaveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      {/* Payment Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Profiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venmo">Venmo Username</Label>
            <Input
              id="venmo"
              value={profile.venmo}
              onChange={(e) => setProfile({ ...profile, venmo: e.target.value })}
              placeholder="@username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paypal">PayPal Email</Label>
            <Input
              id="paypal"
              type="email"
              value={profile.paypal}
              onChange={(e) => setProfile({ ...profile, paypal: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          <Button onClick={handleSaveProfile}>Save Payment Info</Button>
        </CardContent>
      </Card>

      {/* Wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Solana Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Phantom wallet to enable Solana payments and on-chain receipts
          </p>
          <Button variant="outline" className="w-full gap-2">
            <Wallet className="w-4 h-4" />
            Connect Phantom Wallet
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Gentle Collector DMs</Label>
              <p className="text-sm text-muted-foreground">
                Receive private reminders for outstanding payments
              </p>
            </div>
            <Switch
              checked={notifications.enableDMs}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, enableDMs: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                No notifications between 22:00-08:00 UTC
              </p>
            </div>
            <Switch
              checked={notifications.quietHours}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, quietHours: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Escalation Cadence</Label>
              <p className="text-sm text-muted-foreground">
                Increase reminder frequency after 7 days
              </p>
            </div>
            <Switch
              checked={notifications.escalation}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, escalation: checked })
              }
            />
          </div>

          <Button onClick={handleSaveNotifications}>Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
