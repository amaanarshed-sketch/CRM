"use client";

import { isLeadStale } from "@/lib/lead-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { LeadTable } from "./lead-table";

export function StalePage() {
  const { agency, leads } = useApp();
  const threshold = agency?.staleThresholdDays || 7;
  const rows = leads.filter((lead) => isLeadStale(lead, threshold));

  return (
    <AppShell>
      <PageHeader title="Stale Leads" kicker={`No contact in more than ${threshold} days`} />
      <LeadTable rows={rows} />
    </AppShell>
  );
}
