import { formatDate } from "./lead-utils";
import { FollowUpKind, Lead } from "./types";

export const FOLLOW_UP_KINDS: FollowUpKind[] = [
  "First follow-up",
  "Appointment reminder",
  "Info request",
  "Proposal follow-up",
  "Reactivation message",
  "Won lead thank-you",
  "Lost lead polite close",
  "No-response follow-up",
  "Stale lead reactivation"
];

export function isFollowUpKind(value: unknown): value is FollowUpKind {
  return typeof value === "string" && FOLLOW_UP_KINDS.includes(value as FollowUpKind);
}

export function buildTemplateMessage(kind: FollowUpKind, lead: Lead) {
  const name = lead.fullName || "there";
  const interest = lead.jobInterest || "your inquiry";
  const lastContact = formatDate(lead.lastContactedDate);
  const nextFollowUp = formatDate(lead.nextFollowUpDate);
  const infoStatus = lead.documentStatus || "Not requested";
  const notes = lead.notes ? `\n\nContext: ${lead.notes}` : "";

  const templates: Record<FollowUpKind, string> = {
    "First follow-up": `Hi ${name}, thanks for your interest in ${interest}. Are you still open to a quick chat about the next steps? Let me know a good time today or tomorrow.${notes}`,
    "Appointment reminder": `Hi ${name}, quick reminder about our appointment for ${interest}. Please confirm if the time still works for you, or let me know if we should reschedule.${notes}`,
    "Info request": `Hi ${name}, quick follow-up on ${interest}. I just need a little more information to help you properly. Current info status: ${infoStatus}. Could you send the missing details when convenient?${notes}`,
    "Proposal follow-up": `Hi ${name}, checking in on the proposal/details we shared for ${interest}. Any questions or changes you would like us to adjust?${notes}`,
    "Reactivation message": `Hi ${name}, checking back in about ${interest}. We last connected on ${lastContact}. If this is still relevant, I would be happy to pick things back up.${notes}`,
    "Won lead thank-you": `Hi ${name}, thank you for choosing us for ${interest}. We appreciate it and will keep you updated on the next steps.${notes}`,
    "Lost lead polite close": `Hi ${name}, just closing the loop on ${interest}. No worries if the timing is not right now. If anything changes, feel free to message us anytime.${notes}`,
    "No-response follow-up": `Hi ${name}, I tried reaching you after our last contact on ${lastContact}. Are you still interested in ${interest}? A quick yes or no is completely fine.${notes}`,
    "Stale lead reactivation": `Hi ${name}, checking back in about ${interest}. Your follow-up was marked for ${nextFollowUp}. If you are still interested, reply when convenient and I can help with next steps.${notes}`
  };

  return templates[kind];
}
