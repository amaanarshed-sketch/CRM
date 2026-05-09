"use client";

import { sortOldestFollowUpFirst, needsFollowUp } from "@/lib/lead-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { LeadTable } from "./lead-table";

export function FollowUpsPage() {
  const { leads } = useApp();
  const rows = sortOldestFollowUpFirst(leads.filter(needsFollowUp));

  return (
    <AppShell>
      <PageHeader title="Follow-ups" kicker="Oldest due first" />
      <LeadTable rows={rows} />
    </AppShell>
  );
}
