import {
  Lead,
  LeadInput,
  DOCUMENT_STATUSES,
  DocumentStatus,
  PIPELINE_STAGES,
  PipelineStage
} from "./types";

export const TERMINAL_STAGES: PipelineStage[] = ["Won", "Lost"];

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(date: string, days: number) {
  const base = date ? new Date(`${date}T00:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export function daysBetween(fromDate: string, toDate = todayISO()) {
  if (!fromDate) return Number.POSITIVE_INFINITY;
  const from = new Date(`${fromDate}T00:00:00`).getTime();
  const to = new Date(`${toDate}T00:00:00`).getTime();
  return Math.floor((to - from) / 86_400_000);
}

export function isTerminalStage(stage: PipelineStage) {
  return TERMINAL_STAGES.includes(stage);
}

export function isLeadStale(lead: Lead, thresholdDays: number) {
  return !isTerminalStage(lead.stage) && daysBetween(lead.lastContactedDate) > thresholdDays;
}

export function needsFollowUp(lead: Lead) {
  return (
    Boolean(lead.nextFollowUpDate) &&
    lead.nextFollowUpDate <= todayISO() &&
    !isTerminalStage(lead.stage)
  );
}

export function normalizeStage(value?: string): PipelineStage {
  const raw = (value || "").trim().toLowerCase();
  const match = PIPELINE_STAGES.find((stage) => stage.toLowerCase() === raw);
  return match || "New";
}

export function normalizeDocumentStatus(value?: string): DocumentStatus {
  const match = DOCUMENT_STATUSES.find((status) => status.toLowerCase() === (value || "").trim().toLowerCase());
  return match || "Not requested";
}

export function makeLeadInput(input: Partial<LeadInput>): LeadInput {
  return {
    fullName: input.fullName || "",
    phone: input.phone || "",
    email: input.email || "",
    source: input.source || "",
    jobInterest: input.jobInterest || "",
    location: input.location || "",
    assignedStaff: input.assignedStaff || "",
    stage: input.stage || "New",
    lastContactedDate: input.lastContactedDate || "",
    nextFollowUpDate: input.nextFollowUpDate || "",
    documentStatus: input.documentStatus || "Not requested",
    notes: input.notes || "",
    experience: input.experience || ""
  };
}

export function computeMetrics(leads: Lead[], staleThresholdDays: number) {
  const active = leads.filter((lead) => !isTerminalStage(lead.stage));
  return {
    active: active.length,
    followUpsDue: leads.filter(needsFollowUp).length,
    stale: leads.filter((lead) => isLeadStale(lead, staleThresholdDays)).length,
    infoPending: leads.filter((lead) => lead.documentStatus !== "Complete").length,
    appointmentsScheduled: leads.filter((lead) => lead.stage === "Appointment Scheduled").length,
    won: leads.filter((lead) => lead.stage === "Won").length,
    lost: leads.filter((lead) => lead.stage === "Lost").length
  };
}

export function sortOldestFollowUpFirst(leads: Lead[]) {
  return [...leads].sort((a, b) => {
    if (!a.nextFollowUpDate) return 1;
    if (!b.nextFollowUpDate) return -1;
    return a.nextFollowUpDate.localeCompare(b.nextFollowUpDate);
  });
}

export function formatDate(date?: string) {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${date}T00:00:00`)
  );
}

export function getStageTone(stage: PipelineStage) {
  if (stage === "Won") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (stage === "Lost") return "bg-rose-50 text-rose-700 border-rose-200";
  if (stage === "Stale") return "bg-amber-50 text-amber-800 border-amber-200";
  if (stage.includes("Due") || stage.includes("Proposal")) return "bg-orange-50 text-orange-700 border-orange-200";
  if (stage.includes("Appointment")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export function groupCount<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value || "Unassigned"] = (acc[value || "Unassigned"] || 0) + 1;
    return acc;
  }, {});
}
