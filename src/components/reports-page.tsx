"use client";

import { computeMetrics, groupCount, needsFollowUp, todayISO } from "@/lib/lead-utils";
import { PIPELINE_STAGES } from "@/lib/types";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";

export function ReportsPage() {
  const { agency, leads } = useApp();
  const threshold = agency?.staleThresholdDays || 7;
  const metrics = computeMetrics(leads, threshold);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartISO = weekStart.toISOString().slice(0, 10);
  const newThisWeek = leads.filter((lead) => lead.createdAt.slice(0, 10) >= weekStartISO).length;
  const byStaff = groupCount(leads.map((lead) => lead.assignedStaff || "Unassigned"));
  const byStage = groupCount(leads.map((lead) => lead.stage));

  return (
    <AppShell>
      <PageHeader title="Weekly Report" kicker={`Snapshot through ${todayISO()}`} />
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ReportCard label="New leads this week" value={newThisWeek} helper="Fresh opportunities added" />
        <ReportCard label="Follow-ups due" value={leads.filter(needsFollowUp).length} helper="Needs team action" tone="amber" />
        <ReportCard label="Stale leads" value={metrics.stale} helper="Last contact too old" tone="red" />
        <ReportCard label="Info pending" value={metrics.infoPending} helper="Missing details or requirements" tone="amber" />
        <ReportCard label="Appointments scheduled" value={metrics.appointmentsScheduled} helper="Booked conversations" />
        <ReportCard label="Won leads" value={metrics.won} helper="Converted this workspace" tone="green" />
        <ReportCard label="Lost leads" value={metrics.lost} helper="Closed without conversion" tone="red" />
      </section>
      <section className="grid gap-5 lg:grid-cols-2">
        <Breakdown title="Leads by staff member" rows={byStaff} />
        <Breakdown
          title="Leads by stage"
          rows={PIPELINE_STAGES.reduce<Record<string, number>>((acc, stage) => {
            acc[stage] = byStage[stage] || 0;
            return acc;
          }, {})}
        />
      </section>
    </AppShell>
  );
}

function ReportCard({ label, value, helper, tone = "blue" }: { label: string; value: number; helper: string; tone?: "blue" | "amber" | "red" | "green" }) {
  const toneClass = {
    blue: "text-blue-700 bg-blue-50",
    amber: "text-amber-700 bg-amber-50",
    red: "text-red-700 bg-red-50",
    green: "text-emerald-700 bg-emerald-50"
  }[tone];

  return (
    <div className="app-card p-5">
      <p className={`inline-flex rounded-xl px-3 py-1 text-3xl font-black ${toneClass}`}>{value}</p>
      <p className="mt-3 text-sm font-black text-[#08090A]">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[#8A94A6]">{helper}</p>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(rows));
  return (
    <div className="app-card p-5">
      <h2 className="mb-1 text-lg font-black text-[#08090A]">{title}</h2>
      <p className="mb-4 text-sm text-[#687184]">A quick read on ownership and pipeline balance.</p>
      <div className="space-y-3">
        {Object.entries(rows).map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-sm font-bold">
              <span className="text-slate-700">{label}</span>
              <span className="text-[#687184]">{value}</span>
            </div>
            <div className="h-2 rounded-full bg-[#F3EADC]">
              <div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
