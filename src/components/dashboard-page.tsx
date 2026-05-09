"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, FileWarning, Trophy, UserX, Users } from "lucide-react";
import {
  computeMetrics,
  formatDate,
  isCandidateStale,
  needsFollowUp,
  sortOldestFollowUpFirst
} from "@/lib/candidate-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { CandidateTable } from "./candidate-table";

export function DashboardPage() {
  const { agency, candidates } = useApp();
  const staleThreshold = agency?.staleThresholdDays || 7;
  const metrics = computeMetrics(candidates, staleThreshold);
  const dueNow = sortOldestFollowUpFirst(candidates.filter(needsFollowUp)).slice(0, 8);
  const staleRows = candidates.filter((candidate) => isCandidateStale(candidate, staleThreshold)).slice(0, 6);

  return (
    <AppShell>
      <PageHeader
        kicker="Follow-up control center"
        title="Who needs follow-up right now?"
        action={
          <Link href="/candidates" className="btn-primary">
            Add or update leads
          </Link>
        }
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active leads" value={metrics.active} icon={<Users size={20} />} tone="blue" helper="Open opportunities" />
        <MetricCard label="Follow-ups due" value={metrics.followUpsDue} icon={<CalendarClock size={20} />} tone="amber" helper="Needs action" />
        <MetricCard label="Stale leads" value={metrics.stale} icon={<AlertTriangle size={20} />} tone="red" helper="Going cold" />
        <MetricCard label="Info pending" value={metrics.infoPending} icon={<FileWarning size={20} />} tone="amber" helper="Missing details" />
        <MetricCard label="Appointments scheduled" value={metrics.appointmentsScheduled} icon={<CalendarClock size={20} />} tone="blue" helper="Booked conversations" />
        <MetricCard label="Won leads" value={metrics.won} icon={<Trophy size={20} />} tone="green" helper="Converted" />
        <MetricCard label="Lost leads" value={metrics.lost} icon={<UserX size={20} />} tone="red" helper="Closed out" />
        <MetricCard label="Priority queue" value={metrics.followUpsDue + metrics.stale} icon={<CheckCircle2 size={20} />} tone={metrics.followUpsDue + metrics.stale > 0 ? "amber" : "neutral"} helper="Due + stale" />
      </section>

      <section className="mb-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="app-card border-amber-200 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#08090A]">Follow-ups due now</h2>
              <p className="text-sm text-[#687184]">Leads with next follow-up today or earlier, sorted oldest first.</p>
            </div>
            <Link href="/follow-ups" className="text-sm font-black text-[#2563EB] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dueNow.map((candidate) => (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/55 p-3 hover:ring-2 hover:ring-amber-200">
                <span>
                  <strong className="block text-slate-950">{candidate.fullName}</strong>
                  <span className="text-sm text-slate-500">{candidate.jobInterest || "No interest"} - {candidate.phone || "No phone"}</span>
                </span>
                <span className="text-right text-sm font-black text-amber-800">{formatDate(candidate.nextFollowUpDate)}</span>
              </Link>
            ))}
            {!dueNow.length && <EmptyState title="No follow-ups due" body="When a lead needs attention today, it will show up here first." />}
          </div>
        </div>

        <div className="app-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Stale watchlist</h2>
              <p className="text-sm text-[#687184]">Last contact older than {staleThreshold} days.</p>
            </div>
            <Link href="/stale" className="text-sm font-black text-[#2563EB] hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {staleRows.map((candidate) => (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="flex items-center justify-between rounded-xl border border-red-100 p-3 hover:bg-red-50/45">
                <span>
                  <strong className="block text-slate-950">{candidate.fullName}</strong>
                  <span className="text-sm text-slate-500">Last contacted {formatDate(candidate.lastContactedDate)}</span>
                </span>
                <span className="status-pill border-red-200 bg-red-50 text-red-700">{candidate.stage}</span>
              </Link>
            ))}
            {!staleRows.length && <EmptyState title="No stale leads" body="Leads with old contact dates will appear here before they slip away." />}
          </div>
        </div>
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-950">Recent leads</h2>
        <Link href="/candidates" className="text-sm font-black text-[#2563EB] hover:underline">
          Manage all
        </Link>
      </div>
      <CandidateTable rows={candidates.slice(0, 8)} showFilters={false} />
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
  helper
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "blue" | "amber" | "red" | "green" | "neutral";
  helper: string;
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
    neutral: "bg-slate-100 text-slate-600"
  }[tone];

  return (
    <div className="app-card p-4">
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
          {icon}
        </span>
        {value > 0 && (tone === "amber" || tone === "red") && <span className={`status-pill ${toneClass}`}>Action</span>}
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[#8A94A6]">{helper}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="empty-state">
      <p className="font-black text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-[#687184]">{body}</p>
    </div>
  );
}
