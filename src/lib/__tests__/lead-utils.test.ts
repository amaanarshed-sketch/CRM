import { describe, expect, it } from "vitest";
import { computeMetrics, isLeadStale, needsFollowUp, sortOldestFollowUpFirst } from "../lead-utils";
import { Lead } from "../types";

function lead(overrides: Partial<Lead>): Lead {
  return {
    id: "lead_1",
    agencyId: "agency_1",
    fullName: "Test Lead",
    phone: "+94771234567",
    email: "lead@example.com",
    company: "Acme",
    source: "Website",
    jobInterest: "Service inquiry",
    location: "Colombo",
    assignedStaff: "Amaan",
    stage: "New",
    lastContactedDate: "2026-05-01",
    nextFollowUpDate: "2026-05-10",
    documentStatus: "Requested",
    notes: "",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides
  };
}

describe("lead-utils launch calculations", () => {
  it("flags due follow-ups while excluding terminal stages", () => {
    expect(needsFollowUp(lead({ nextFollowUpDate: "2026-05-01" }))).toBe(true);
    expect(needsFollowUp(lead({ stage: "Won", nextFollowUpDate: "2026-05-01" }))).toBe(false);
    expect(needsFollowUp(lead({ stage: "Lost", nextFollowUpDate: "2026-05-01" }))).toBe(false);
  });

  it("flags stale leads while excluding won and lost leads", () => {
    expect(isLeadStale(lead({ lastContactedDate: "2026-04-01" }), 7)).toBe(true);
    expect(isLeadStale(lead({ stage: "Lost", lastContactedDate: "2026-04-01" }), 7)).toBe(false);
  });

  it("computes dashboard metrics from workspace leads", () => {
    const leads = [
      lead({ id: "1", stage: "New", documentStatus: "Requested", nextFollowUpDate: "2026-05-01" }),
      lead({ id: "2", stage: "Appointment Scheduled", documentStatus: "Complete", nextFollowUpDate: "2026-05-20" }),
      lead({ id: "3", stage: "Won", documentStatus: "Complete" }),
      lead({ id: "4", stage: "Lost", documentStatus: "Missing" })
    ];

    expect(computeMetrics(leads, 7)).toMatchObject({
      active: 2,
      followUpsDue: 1,
      appointmentsScheduled: 1,
      won: 1,
      lost: 1,
      infoPending: 2
    });
  });

  it("sorts due leads oldest first and pushes missing dates last", () => {
    const sorted = sortOldestFollowUpFirst([
      lead({ id: "later", nextFollowUpDate: "2026-05-10" }),
      lead({ id: "missing", nextFollowUpDate: "" }),
      lead({ id: "oldest", nextFollowUpDate: "2026-05-01" })
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["oldest", "later", "missing"]);
  });
});
