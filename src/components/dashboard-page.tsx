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
          <Link href="/candidates" className="rounded-lg bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800">
            Add or update leads
          </Link>
        }
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Active leads" value={metrics.active} icon={<Users size={20} />} />
        <MetricCard label="Follow-ups due" value={metrics.followUpsDue} icon={<CalendarClock size={20} />} urgent />
        <MetricCard label="Stale leads" value={metrics.stale} icon={<AlertTriangle size={20} />} urgent />
        <MetricCard label="Info pending" value={metrics.infoPending} icon={<FileWarning size={20} />} />
        <MetricCard label="Appointments scheduled" value={metrics.appointmentsScheduled} icon={<CalendarClock size={20} />} />
        <MetricCard label="Won leads" value={metrics.won} icon={<Trophy size={20} />} success />
        <MetricCard label="Lost leads" value={metrics.lost} icon={<UserX size={20} />} />
        <MetricCard label="Recovery priority" value={metrics.followUpsDue + metrics.stale} icon={<CheckCircle2 size={20} />} urgent={metrics.followUpsDue + metrics.stale > 0} />
      </section>

      <section className="mb-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-amber-950">Follow-up due now</h2>
              <p className="text-sm text-amber-800">Leads with next follow-up today or earlier.</p>
            </div>
            <Link href="/follow-ups" className="text-sm font-black text-amber-900 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dueNow.map((candidate) => (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm hover:ring-2 hover:ring-amber-200">
                <span>
                  <strong className="block text-slate-950">{candidate.fullName}</strong>
                  <span className="text-sm text-slate-500">{candidate.jobInterest || "No interest"} - {candidate.phone || "No phone"}</span>
                </span>
                <span className="text-right text-sm font-black text-amber-800">{formatDate(candidate.nextFollowUpDate)}</span>
              </Link>
            ))}
            {!dueNow.length && <p className="rounded-lg bg-white p-4 text-sm font-semibold text-slate-600">Nothing due right now. A calm dashboard, as rare and pleasant as it sounds.</p>}
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">Stale watchlist</h2>
              <p className="text-sm text-slate-500">Last contact older than {staleThreshold} days.</p>
            </div>
            <Link href="/stale" className="text-sm font-black text-teal-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {staleRows.map((candidate) => (
              <Link key={candidate.id} href={`/candidates/${candidate.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                <span>
                  <strong className="block text-slate-950">{candidate.fullName}</strong>
                  <span className="text-sm text-slate-500">Last contacted {formatDate(candidate.lastContactedDate)}</span>
                </span>
                <span className="status-pill border-rose-200 bg-rose-50 text-rose-700">{candidate.stage}</span>
              </Link>
            ))}
            {!staleRows.length && <p className="rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-600">No stale leads under the current threshold.</p>}
          </div>
        </div>
      </section>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-950">Recent leads</h2>
        <Link href="/candidates" className="text-sm font-black text-teal-700 hover:underline">
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
  urgent,
  success
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  urgent?: boolean;
  success?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${urgent ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${success ? "bg-emerald-50 text-emerald-700" : urgent ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>
          {icon}
        </span>
        {urgent && value > 0 && <span className="status-pill border-amber-200 bg-white text-amber-800">Action</span>}
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}
