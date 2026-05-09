"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";

export function IntakePage() {
  const { agency } = useApp();
  const url = typeof window !== "undefined" && agency ? `${window.location.origin}/intake/${agency.id}` : "";

  return (
    <AppShell>
      <PageHeader title="Intake Form" kicker="Public candidate link" />
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Share this link with candidates</h2>
        <p className="mt-1 text-sm text-slate-500">
          Submissions enter your agency database as stage New. No messages are sent automatically.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input readOnly value={url} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={() => navigator.clipboard?.writeText(url)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 hover:bg-slate-50">
            <Copy size={16} />
            Copy
          </button>
          <Link href={agency ? `/intake/${agency.id}` : "/intake"} className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 py-2 font-bold text-white hover:bg-teal-800">
            <ExternalLink size={16} />
            Open
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
