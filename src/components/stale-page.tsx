"use client";

import { isCandidateStale } from "@/lib/candidate-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { CandidateTable } from "./candidate-table";

export function StalePage() {
  const { agency, candidates } = useApp();
  const threshold = agency?.staleThresholdDays || 7;
  const rows = candidates.filter((candidate) => isCandidateStale(candidate, threshold));

  return (
    <AppShell>
      <PageHeader title="Stale Leads" kicker={`No contact in more than ${threshold} days`} />
      <CandidateTable rows={rows} />
    </AppShell>
  );
}
