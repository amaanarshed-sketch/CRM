"use client";

import { sortOldestFollowUpFirst, needsFollowUp } from "@/lib/candidate-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { CandidateTable } from "./candidate-table";

export function FollowUpsPage() {
  const { candidates } = useApp();
  const rows = sortOldestFollowUpFirst(candidates.filter(needsFollowUp));

  return (
    <AppShell>
      <PageHeader title="Follow-ups" kicker="Oldest due first" />
      <CandidateTable rows={rows} />
    </AppShell>
  );
}
