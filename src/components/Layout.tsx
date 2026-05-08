import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/transactions", label: "سجل العمليات", icon: ClipboardList },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Layout({ children, darkMode, toggleDarkMode }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const emailInitial = user?.email?.charAt(0).toUpperCase() || "م";
  const shortEmail = user?.email?.split("@")[0] || "المستخدم";

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 right-0 h-screen z-20 sidebar-gradient border-l border-sidebar-border">
        <div className="px-6 py-5 border-b border-sidebar-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-sm leading-tight">نظام إدارة</h1>
              <p className="text-xs text-sidebar-foreground/50 mt-0.5">المبيعات والمالية</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-3 mb-3">القائمة الرئيسية</p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/25"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
                data-testid={`nav-${label}`}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-white" : "")} />
                <span className="flex-1">{label}</span>
                {active && <ChevronLeft className="w-3.5 h-3.5 text-white/70" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border/60 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
            data-testid="button-toggle-theme"
          >
            <div className="w-7 h-7 rounded-lg bg-sidebar-accent flex items-center justify-center">
              {darkMode
                ? <Sun className="w-3.5 h-3.5 text-amber-400" />
                : <Moon className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <span>{darkMode ? "الوضع الفاتح" : "الوضع الداكن"}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-sidebar-accent transition-all duration-200 group"
                data-testid="button-user-menu"
              >
                <Avatar className="w-8 h-8 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">{emailInitial}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-right min-w-0">
                  <p className="text-xs font-semibold text-sidebar-foreground truncate">{shortEmail}</p>
                  <p className="text-[10px] text-sidebar-foreground/40 truncate">{user?.email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-48">
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive gap-2 font-medium">
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 glass bg-card/90 border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl"
          data-testid="button-mobile-menu"
        >
          <AnimatePresence mode="wait">
            {mobileOpen
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5" />
                </motion.div>
              : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="w-5 h-5" />
                </motion.div>
            }
          </AnimatePresence>
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm text-foreground">نظام إدارة المبيعات</span>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-xl">
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
            className="md:hidden fixed inset-0 z-10 sidebar-gradient pt-16"
            dir="rtl"
          >
            <nav className="p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-3 mb-3">القائمة الرئيسية</p>
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all",
                    location === href
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <div className="pt-4 border-t border-sidebar-border/40 mt-2 space-y-1">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full transition-all"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
                  {darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 w-full transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:mr-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-4 md:p-7 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
