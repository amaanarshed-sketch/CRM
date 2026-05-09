"use client";

import { computeMetrics, groupCount, needsFollowUp, todayISO } from "@/lib/candidate-utils";
import { PIPELINE_STAGES } from "@/lib/types";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";

export function ReportsPage() {
  const { agency, candidates } = useApp();
  const threshold = agency?.staleThresholdDays || 7;
  const metrics = computeMetrics(candidates, threshold);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartISO = weekStart.toISOString().slice(0, 10);
  const newThisWeek = candidates.filter((candidate) => candidate.createdAt.slice(0, 10) >= weekStartISO).length;
  const byStaff = groupCount(candidates.map((candidate) => candidate.assignedStaff || "Unassigned"));
  const byStage = groupCount(candidates.map((candidate) => candidate.stage));

  return (
    <AppShell>
      <PageHeader title="Weekly Report" kicker={`Snapshot through ${todayISO()}`} />
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ReportCard label="New candidates this week" value={newThisWeek} />
        <ReportCard label="Follow-ups due" value={candidates.filter(needsFollowUp).length} />
        <ReportCard label="Stale candidates" value={metrics.stale} />
        <ReportCard label="Documents pending" value={metrics.documentsPending} />
        <ReportCard label="Interviews scheduled" value={metrics.interviewsScheduled} />
        <ReportCard label="Placed candidates" value={metrics.placed} />
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <Breakdown title="Candidates by staff member" rows={byStaff} />
        <Breakdown
          title="Candidates by stage"
          rows={PIPELINE_STAGES.reduce<Record<string, number>>((acc, stage) => {
            acc[stage] = byStage[stage] || 0;
            return acc;
          }, {})}
        />
      </section>
    </AppShell>
  );
}

function ReportCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(rows));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-black text-slate-950">{title}</h2>
      <div className="space-y-3">
        {Object.entries(rows).map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-sm font-bold">
              <span className="text-slate-700">{label}</span>
              <span className="text-slate-500">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-teal-600" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
