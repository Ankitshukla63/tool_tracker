import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Wrench, ArrowLeftRight, Scan, LogOut } from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const username = localStorage.getItem("rfid_username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("rfid_token");
    localStorage.removeItem("rfid_username");
    setLocation("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tools", label: "Tool Master", icon: Wrench },
    { path: "/issue", label: "Issue / Return", icon: ArrowLeftRight },
    { path: "/scan", label: "RFID Scan", icon: Scan },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center mr-3">
            <Scan className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground tracking-tight">RFID CTRL</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}`}>
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : ''}`} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-sidebar-foreground/50 font-medium uppercase tracking-wider">Operator</span>
              <span className="text-sm font-medium text-sidebar-foreground">{username}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10" data-testid="button-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
