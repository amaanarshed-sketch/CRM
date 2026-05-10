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
      <PageHeader title="Lead Form" kicker="Public lead intake link" />
      <section className="app-card glass-panel surface-enter p-5">
        <h2 className="text-lg font-black text-[#08090A]">Share this link with leads</h2>
        <p className="mt-1 text-sm text-[#687184]">
          Submissions enter your workspace as stage New. No messages are sent automatically.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input readOnly value={url} className="field-control flex-1 text-sm" />
          <button onClick={() => navigator.clipboard?.writeText(url)} className="btn-secondary">
            <Copy size={16} />
            Copy
          </button>
          <Link href={agency ? `/intake/${agency.id}` : "/intake"} className="btn-primary">
            <ExternalLink size={16} />
            Open
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
