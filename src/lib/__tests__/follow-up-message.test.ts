import { describe, expect, it } from "vitest";
import { buildTemplateMessage, FOLLOW_UP_KINDS, isFollowUpKind } from "../follow-up-message";
import { Lead } from "../types";

const lead: Lead = {
  id: "lead_1",
  agencyId: "agency_1",
  fullName: "Sarah Ahmed",
  phone: "+94771234567",
  email: "sarah@example.com",
  company: "Glow Studio",
  source: "Instagram",
  jobInterest: "Salon package",
  location: "Colombo",
  assignedStaff: "Priya",
  stage: "Proposal Sent",
  lastContactedDate: "2026-05-01",
  nextFollowUpDate: "2026-05-10",
  documentStatus: "Partial",
  notes: "Asked for weekend availability.",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z"
};

describe("follow-up message templates", () => {
  it("validates supported launch message types", () => {
    expect(FOLLOW_UP_KINDS).toContain("Proposal follow-up");
    expect(isFollowUpKind("Proposal follow-up")).toBe(true);
    expect(isFollowUpKind("Send automatically")).toBe(false);
  });

  it("builds concise copy-ready text without sending language", () => {
    const message = buildTemplateMessage("Proposal follow-up", lead);

    expect(message).toContain("Sarah Ahmed");
    expect(message).toContain("Salon package");
    expect(message).toContain("Context: Asked for weekend availability.");
    expect(message.toLowerCase()).not.toContain("sent successfully");
  });

  it("falls back gracefully when lead fields are missing", () => {
    const message = buildTemplateMessage("First follow-up", { ...lead, fullName: "", jobInterest: "" });

    expect(message).toContain("Hi there");
    expect(message).toContain("your inquiry");
  });
});
