import { readSheet } from "read-excel-file/browser";
import { makeLeadInput, normalizeDocumentStatus, normalizeStage } from "./lead-utils";
import { Lead, LeadInput } from "./types";

export type ImportField =
  | "ignore"
  | "fullName"
  | "phone"
  | "email"
  | "company"
  | "source"
  | "stage"
  | "notes"
  | "lastContactedDate"
  | "nextFollowUpDate"
  | "assignedStaff"
  | "jobInterest"
  | "location"
  | "documentStatus";

export type ImportMapping = Record<string, ImportField>;

export type ParsedImportFile = {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
};

export type PreparedImportRow = {
  rowNumber: number;
  values: Record<string, string>;
  input: LeadInput;
  errors: string[];
  duplicate?: {
    kind: "phone" | "email" | "file";
    label: string;
    existingLeadId?: string;
  };
};

export const IMPORT_FIELD_OPTIONS: { value: ImportField; label: string }[] = [
  { value: "ignore", label: "Ignore" },
  { value: "fullName", label: "Lead name" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "company", label: "Company" },
  { value: "source", label: "Source" },
  { value: "stage", label: "Stage" },
  { value: "assignedStaff", label: "Assigned staff" },
  { value: "jobInterest", label: "Requirement / interest" },
  { value: "location", label: "Location" },
  { value: "documentStatus", label: "Info status" },
  { value: "lastContactedDate", label: "Last contacted" },
  { value: "nextFollowUpDate", label: "Next follow-up" },
  { value: "notes", label: "Notes" }
];

const HEADER_MATCHES: Record<Exclude<ImportField, "ignore">, string[]> = {
  fullName: ["name", "fullname", "customername", "leadname", "clientname", "contactname", "person"],
  phone: ["phone", "mobile", "contactnumber", "whatsapp", "whatsappphone", "telephone", "tel"],
  email: ["email", "emailaddress", "mail"],
  company: ["company", "businessname", "business", "organization", "organisation"],
  source: ["source", "leadsource", "channel", "origin"],
  stage: ["status", "stage", "pipelinestage", "pipeline"],
  notes: ["notes", "remarks", "comment", "comments", "description"],
  lastContactedDate: ["lastcontacted", "lastcontactdate", "lastcontacteddate", "lastcontactedat", "last_contacted_at"],
  nextFollowUpDate: ["nextfollowup", "followupdate", "nextcontactdate", "nextfollowupdate", "nextfollowupat", "next_follow_up_at"],
  assignedStaff: ["assignedto", "staff", "owner", "salesperson", "assignee", "assignedstaff"],
  jobInterest: ["requirement", "requirements", "interestedin", "service", "product", "interest", "leadinterest", "inquiry"],
  location: ["location", "city", "area"],
  documentStatus: ["infostatus", "requirementstatus", "detailsstatus", "documentstatus"]
};

export async function parseImportFile(file: File): Promise<ParsedImportFile> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let matrix: string[][] = [];

  if (extension === "csv") {
    matrix = parseCSV(await file.text());
  } else if (extension === "xlsx") {
    const rows = await readSheet(file);
    matrix = rows.map((row) => row.map(cellToString));
  } else {
    throw new Error("Upload a CSV or Excel .xlsx file.");
  }

  const nonEmptyRows = matrix.filter((row) => row.some((cell) => cell.trim()));
  const [headerRow, ...bodyRows] = nonEmptyRows;
  if (!headerRow?.length) throw new Error("We could not find column headers in this file.");

  const headers = dedupeHeaders(headerRow.map((header, index) => header.trim() || `Column ${index + 1}`));
  const rows = bodyRows
    .map((row) =>
      headers.reduce<Record<string, string>>((acc, header, index) => {
        acc[header] = row[index]?.trim() || "";
        return acc;
      }, {})
    )
    .filter((row) => Object.values(row).some(Boolean));

  return { fileName: file.name, headers, rows };
}

export function suggestImportMapping(headers: string[]): ImportMapping {
  return headers.reduce<ImportMapping>((mapping, header) => {
    const normalized = normalizeHeader(header);
    const match = Object.entries(HEADER_MATCHES).find(([, aliases]) => aliases.includes(normalized));
    mapping[header] = (match?.[0] as ImportField | undefined) || "ignore";
    return mapping;
  }, {});
}

export function prepareImportRows(rows: Record<string, string>[], mapping: ImportMapping, existingLeads: Lead[]): PreparedImportRow[] {
  const existingPhones = new Map<string, Lead>();
  const existingEmails = new Map<string, Lead>();
  existingLeads.forEach((lead) => {
    const phone = normalizePhone(lead.phone);
    const email = normalizeEmail(lead.email);
    if (phone) existingPhones.set(phone, lead);
    if (email) existingEmails.set(email, lead);
  });
  const seen = new Set<string>();

  return rows.map((values, index) => {
    const input = makeLeadInput({});
    Object.entries(mapping).forEach(([header, field]) => {
      if (field === "ignore") return;
      const value = values[header] || "";
      if (field === "stage") input.stage = normalizeStage(value);
      else if (field === "documentStatus") input.documentStatus = normalizeDocumentStatus(value);
      else if (field === "lastContactedDate" || field === "nextFollowUpDate") input[field] = normalizeDate(value);
      else input[field] = value;
    });

    const errors: string[] = [];
    if (!input.fullName.trim() && !input.phone.trim()) errors.push("Lead name or phone number is required.");

    const phone = normalizePhone(input.phone);
    const email = normalizeEmail(input.email);
    const existingByPhone = phone ? existingPhones.get(phone) : undefined;
    const existingByEmail = !existingByPhone && email ? existingEmails.get(email) : undefined;
    const duplicateKey = phone ? `phone:${phone}` : email ? `email:${email}` : "";
    const fileDuplicate = duplicateKey && seen.has(duplicateKey);
    if (duplicateKey) seen.add(duplicateKey);

    return {
      rowNumber: index + 2,
      values,
      input,
      errors,
      duplicate: existingByPhone
        ? { kind: "phone", label: input.phone, existingLeadId: existingByPhone.id }
        : existingByEmail
          ? { kind: "email", label: input.email, existingLeadId: existingByEmail.id }
          : fileDuplicate
            ? { kind: "file", label: input.phone || input.email }
            : undefined
    };
  });
}

export function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cellToString(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value === null || value === undefined ? "" : String(value).trim();
}

function normalizeDate(value: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return value;
}

function dedupeHeaders(headers: string[]) {
  const seen = new Map<string, number>();
  return headers.map((header) => {
    const count = seen.get(header) || 0;
    seen.set(header, count + 1);
    return count ? `${header} ${count + 1}` : header;
  });
}

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
    } else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) {
      row.push(current.trim());
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current.trim());
      rows.push(row);
      row = [];
      current = "";
    } else current += char;
  }

  row.push(current.trim());
  rows.push(row);
  return rows;
}
