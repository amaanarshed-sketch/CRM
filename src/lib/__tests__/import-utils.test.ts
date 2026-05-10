import { describe, expect, it } from "vitest";
import { parseImportFile, prepareImportRows, suggestImportMapping } from "../import-utils";
import { Lead } from "../types";

function existingLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: "existing",
    agencyId: "agency_1",
    fullName: "Existing Lead",
    phone: "+94771234567",
    email: "existing@example.com",
    company: "Acme",
    source: "Website",
    jobInterest: "Service inquiry",
    location: "Colombo",
    assignedStaff: "Amaan",
    stage: "Contacted",
    lastContactedDate: "2026-05-01",
    nextFollowUpDate: "2026-05-10",
    documentStatus: "Requested",
    notes: "",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z",
    ...overrides
  };
}

describe("import-utils launch import behavior", () => {
  it("parses CSV headers, ignores empty rows, and preserves quoted commas", async () => {
    const csv = "lead name,phone,notes\nSarah,+94770000000,\"Asked for pricing, urgent\"\n,,\n";
    const file = new File([csv], "leads.csv", { type: "text/csv" });

    const parsed = await parseImportFile(file);

    expect(parsed.headers).toEqual(["lead name", "phone", "notes"]);
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0].notes).toBe("Asked for pricing, urgent");
  });

  it("suggests mappings for common lead sheet column names", () => {
    expect(suggestImportMapping(["Customer Name", "Whatsapp", "Assigned To", "Interested In", "Next Follow-up"])).toMatchObject({
      "Customer Name": "fullName",
      Whatsapp: "phone",
      "Assigned To": "assignedStaff",
      "Interested In": "jobInterest",
      "Next Follow-up": "nextFollowUpDate"
    });
  });

  it("marks rows invalid when both lead name and phone are missing", () => {
    const rows = prepareImportRows(
      [{ Notes: "No identity" }],
      { Notes: "notes" },
      []
    );

    expect(rows[0].errors).toContain("Lead name or phone number is required.");
  });

  it("detects duplicates by existing phone first, then file duplicates", () => {
    const rows = prepareImportRows(
      [
        { Name: "Sarah", Phone: "+94 77 123 4567", Email: "sarah@example.com" },
        { Name: "Sarah Copy", Phone: "+94 77 123 4567", Email: "other@example.com" }
      ],
      { Name: "fullName", Phone: "phone", Email: "email" },
      [existingLead()]
    );

    expect(rows[0].duplicate).toMatchObject({ kind: "phone", existingLeadId: "existing" });
    expect(rows[1].duplicate).toMatchObject({ kind: "phone", existingLeadId: "existing" });
  });
});
