"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarClock,
  FileUp,
  FormInput,
  LayoutDashboard,
  LogOut,
  Settings,
  Siren,
  Users
} from "lucide-react";
import { useApp } from "./app-provider";
import { AuthScreen } from "./auth-screen";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/stale", label: "Stale Leads", icon: Siren },
  { href: "/import", label: "Import", icon: FileUp },
  { href: "/intake", label: "Lead Form", icon: FormInput },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, user, agency, logout, isDemo } = useApp();
  const pathname = usePathname();

  if (!ready) return <div className="grid min-h-screen place-items-center text-slate-500">Loading workspace...</div>;
  if (!user || !agency) return <AuthScreen />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[276px_1fr]">
      <aside className="glass-panel border-b border-[#D8CCBD]/70 lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:py-6">
          <Link href="/dashboard" className="flex items-center gap-3 font-black text-[#08090A]">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2563EB] text-white shadow-lg shadow-blue-600/20 transition-transform duration-200 hover:-translate-y-0.5">
              <Activity size={22} />
            </span>
            <span>
              <span className="block text-lg leading-tight">LeadLoop</span>
              <span className="block text-xs font-bold text-[#687184]">Follow-up CRM</span>
            </span>
          </Link>
          <button onClick={logout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Log out">
            <LogOut size={20} />
          </button>
        </div>
        {isDemo && (
          <div className="glass-soft mx-4 mb-4 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 shadow-amber-900/5">
            Demo workspace — sample data only
          </div>
        )}
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold ${
                  active ? "bg-white/80 text-[#1D4ED8] shadow-sm ring-1 ring-blue-100" : "text-[#687184] hover:bg-white/58 hover:text-[#08090A]"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-[#D8CCBD]/70 p-4 lg:block">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Workspace</p>
          <p className="mt-1 font-bold text-slate-900">{agency.name}</p>
          <p className="text-sm text-slate-500">{user.fullName}</p>
          <button onClick={logout} className="btn-secondary mt-4 w-full text-sm">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

export function PageHeader({ title, kicker, action }: { title: string; kicker?: string; action?: React.ReactNode }) {
  return (
    <div className="glass-soft sticky top-0 z-30 -mx-4 mb-6 flex flex-col gap-3 rounded-b-2xl px-4 py-3 sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
      <div>
        {kicker && <p className="eyebrow">{kicker}</p>}
        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#08090A]">{title}</h1>
      </div>
      {action}
    </div>
  );
}
