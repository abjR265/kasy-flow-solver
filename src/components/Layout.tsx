import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CreditCard, Vault, Receipt, Award, Code, Settings, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores/useStore";
import { GroupSwitcher } from "./GroupSwitcher";

type Props = {
  children: ReactNode;
};

const navItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/payments", icon: CreditCard, label: "Payments" },
  { path: "/vaults", icon: Vault, label: "Vaults" },
  { path: "/receipts", icon: Receipt, label: "Receipts" },
  { path: "/reputation", icon: Award, label: "Reputation" },
  { path: "/dev", icon: Code, label: "Dev" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Layout({ children }: Props) {
  const location = useLocation();
  const currentUser = useStore((state) => state.currentUser);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-lg font-bold text-white">K</span>
            </div>
            <span className="text-xl font-bold gradient-text">KASY</span>
          </Link>

          {/* Group Switcher */}
          <GroupSwitcher />

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.displayName} />
                    <AvatarFallback>{currentUser?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{currentUser?.displayName}</p>
                    <p className="text-sm text-muted-foreground">{currentUser?.handle}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="border-t border-border">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
