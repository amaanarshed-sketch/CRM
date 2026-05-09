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
  { href: "/candidates", label: "Leads", icon: Users },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/stale", label: "Stale Leads", icon: Siren },
  { href: "/import", label: "Import CSV", icon: FileUp },
  { href: "/intake", label: "Lead Form", icon: FormInput },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, user, agency, logout } = useApp();
  const pathname = usePathname();

  if (!ready) return <div className="grid min-h-screen place-items-center text-slate-500">Loading workspace...</div>;
  if (!user || !agency) return <AuthScreen />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5">
          <Link href="/dashboard" className="flex items-center gap-3 font-black text-slate-950">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 text-white">
              <Activity size={22} />
            </span>
            <span>
              <span className="block leading-tight">LeadLoop</span>
            </span>
          </Link>
          <button onClick={logout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Log out">
            <LogOut size={20} />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold ${
                  active ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden border-t border-slate-200 p-4 lg:block">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Workspace</p>
          <p className="mt-1 font-bold text-slate-900">{agency.name}</p>
          <p className="text-sm text-slate-500">{user.fullName}</p>
          <button onClick={logout} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export function PageHeader({ title, kicker, action }: { title: string; kicker?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <p className="text-sm font-bold uppercase tracking-wide text-teal-700">{kicker}</p>}
        <h1 className="text-3xl font-black tracking-tight text-slate-950">{title}</h1>
      </div>
      {action}
    </div>
  );
}
