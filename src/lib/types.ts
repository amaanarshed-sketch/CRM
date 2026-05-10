export const PIPELINE_STAGES = [
  "New",
  "Contacted",
  "Follow-up Due",
  "Interested",
  "Appointment Scheduled",
  "Proposal Sent",
  "Won",
  "Lost",
  "Stale"
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const DOCUMENT_STATUSES = [
  "Not requested",
  "Requested",
  "Partial",
  "Complete",
  "Missing"
] as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

export type Agency = {
  id: string;
  name: string;
  staleThresholdDays: number;
  defaultFollowUpDays: number;
  onboardingCompleted: boolean;
  createdAt: string;
};

export type Profile = {
  id: string;
  agencyId: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
};

export type StaffMember = {
  id: string;
  agencyId: string;
  name: string;
  email?: string;
  createdAt: string;
};

export type Lead = {
  id: string;
  agencyId: string;
  fullName: string;
  phone: string;
  email: string;
  company: string;
  source: string;
  jobInterest: string;
  location: string;
  assignedStaff: string;
  stage: PipelineStage;
  lastContactedDate: string;
  nextFollowUpDate: string;
  documentStatus: DocumentStatus;
  notes: string;
  experience?: string;
  createdAt: string;
  updatedAt: string;
};

export type FollowUpKind =
  | "First follow-up"
  | "Appointment reminder"
  | "Info request"
  | "Proposal follow-up"
  | "Reactivation message"
  | "Won lead thank-you"
  | "Lost lead polite close"
  | "No-response follow-up"
  | "Stale lead reactivation";

export type AppData = {
  agencies: Agency[];
  users: Profile[];
  staffMembers: StaffMember[];
  leads: Lead[];
};

export type LeadInput = Omit<Lead, "id" | "agencyId" | "createdAt" | "updatedAt">;
