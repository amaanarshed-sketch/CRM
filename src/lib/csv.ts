import { makeCandidateInput, normalizeDocumentStatus, normalizeStage } from "./candidate-utils";
import { CandidateInput } from "./types";

function parseCSV(text: string) {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

export function parseCandidateCSV(text: string): CandidateInput[] {
  const rows = parseCSV(text);
  const [headers, ...body] = rows;
  if (!headers?.length) return [];
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());

  return body
    .map((row) => {
      const value = (...fields: string[]) => {
        const index = fields.map((field) => normalizedHeaders.indexOf(field)).find((item) => item >= 0);
        return index === undefined ? "" : row[index] || "";
      };
      return makeCandidateInput({
        fullName: value("full_name", "name", "lead_name"),
        phone: value("phone"),
        email: value("email"),
        source: value("source"),
        jobInterest: value("job_interest", "interest", "lead_interest"),
        location: value("location"),
        assignedStaff: value("assigned_staff"),
        stage: normalizeStage(value("stage")),
        lastContactedDate: value("last_contacted_date"),
        nextFollowUpDate: value("next_follow_up_date"),
        documentStatus: normalizeDocumentStatus(value("document_status", "info_status")),
        notes: value("notes")
      });
    })
    .filter((candidate) => candidate.fullName || candidate.phone || candidate.email);
}
