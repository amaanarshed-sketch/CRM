"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ArrowRight, CalendarClock, FileUp, MessageSquare, ShieldCheck } from "lucide-react";
import { useApp } from "./app-provider";

export function LandingPage() {
  const { startDemo } = useApp();
  const router = useRouter();
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com";

  function openDemo() {
    startDemo();
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-black text-[#08090A]">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2563EB] text-white shadow-lg shadow-blue-600/20">
            <Activity size={22} />
          </span>
          <span>
            <span className="block text-lg leading-tight">LeadLoop</span>
            <span className="block text-xs font-bold text-[#687184]">Follow-up CRM</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-secondary hidden sm:inline-flex">Log in</Link>
          <button onClick={openDemo} className="btn-primary">Try demo</button>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pt-16">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Simple sales follow-up CRM</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight tracking-tight text-[#08090A] sm:text-6xl">
            Stop losing leads to messy spreadsheets and memory.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-[#687184]">
            LeadLoop helps small teams track leads, stale follow-ups, notes, assigned staff, imports, and public intake forms without turning into a heavy CRM.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button onClick={openDemo} className="btn-primary">
              Try demo workspace
              <ArrowRight size={18} />
            </button>
            <a className="btn-secondary" href={`mailto:${supportEmail}?subject=LeadLoop access request`}>
              Request access
            </a>
            <Link href="/dashboard" className="btn-ghost">Sign up or log in</Link>
          </div>
          <p className="mt-4 text-sm font-bold text-[#8A94A6]">
            Demo uses sample data only. No WhatsApp or email sending is included.
          </p>
        </div>

        <div className="app-card glass-panel p-4 shadow-2xl shadow-slate-900/10">
          <div className="grid gap-3 sm:grid-cols-2">
            <PreviewCard icon={<CalendarClock size={20} />} label="Follow-ups due" value="8" tone="amber" />
            <PreviewCard icon={<ShieldCheck size={20} />} label="Stale leads" value="3" tone="red" />
            <PreviewCard icon={<FileUp size={20} />} label="CSV/XLSX imports" value="Ready" tone="blue" />
            <PreviewCard icon={<MessageSquare size={20} />} label="Draft messages" value="Copy-only" tone="green" />
          </div>
          <div className="mt-4 rounded-xl border border-[#D8CCBD]/70 bg-white/82 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-black text-[#08090A]">Today&apos;s priority queue</h2>
              <span className="status-pill border-amber-200 bg-amber-50 text-amber-800">Needs action</span>
            </div>
            {[
              ["Sarah Ahmed", "Salon bridal package", "Due today"],
              ["Rizwan Khan", "B2B agency service", "Stale"],
              ["Nadeesha Silva", "Real estate buyer", "Proposal follow-up"]
            ].map(([name, interest, status]) => (
              <div key={name} className="flex items-center justify-between border-t border-[#D8CCBD]/55 py-3 first:border-t-0">
                <span>
                  <strong className="block text-[#08090A]">{name}</strong>
                  <span className="text-sm font-semibold text-[#687184]">{interest}</span>
                </span>
                <span className="text-sm font-black text-[#2563EB]">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#D8CCBD]/70 px-4 py-6 text-sm font-bold text-[#687184] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>LeadLoop - lightweight lead follow-up CRM</span>
        <span className="flex gap-4">
          <Link className="hover:text-[#2563EB]" href="/privacy">Privacy</Link>
          <Link className="hover:text-[#2563EB]" href="/terms">Terms</Link>
          <Link className="hover:text-[#2563EB]" href="/contact">Contact</Link>
        </span>
      </footer>
    </main>
  );
}

function PreviewCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "blue" | "amber" | "red" | "green";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    green: "bg-emerald-50 text-emerald-700"
  }[tone];

  return (
    <div className="rounded-xl border border-[#D8CCBD]/70 bg-white/78 p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>{icon}</span>
      <p className="mt-4 text-2xl font-black text-[#08090A]">{value}</p>
      <p className="text-sm font-bold text-[#687184]">{label}</p>
    </div>
  );
}
