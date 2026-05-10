"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, FileUp } from "lucide-react";
import {
  IMPORT_FIELD_OPTIONS,
  ImportMapping,
  ParsedImportFile,
  parseImportFile,
  prepareImportRows,
  suggestImportMapping
} from "@/lib/import-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";

type DuplicateMode = "skip" | "update" | "import";

type ImportSummary = {
  totalRows: number;
  imported: number;
  updated: number;
  duplicatesSkipped: number;
  failed: { rowNumber: number; reason: string }[];
};

const sampleCsv = [
  "lead name,phone,email,company,source,stage,assigned to,requirement,next follow-up,notes",
  "Sarah Ahmed,+94771234567,sarah@example.com,Glow Studio,Instagram,New,Priya,Salon bridal package,2026-05-15,Asked for pricing",
  "Daniel Perera,+94715550199,daniel@example.com,Perera Events,Referral,Contacted,Amaan,Private event package,2026-05-18,Needs menu options"
].join("\n");

export function ImportPage() {
  const { leads, addLead, updateLead } = useApp();
  const [parsed, setParsed] = useState<ParsedImportFile | null>(null);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [duplicateMode, setDuplicateMode] = useState<DuplicateMode>("skip");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const preparedRows = useMemo(
    () => (parsed ? prepareImportRows(parsed.rows, mapping, leads) : []),
    [leads, mapping, parsed]
  );
  const invalidRows = preparedRows.filter((row) => row.errors.length);
  const duplicateRows = preparedRows.filter((row) => row.duplicate && !row.errors.length);
  const validRows = preparedRows.filter((row) => !row.errors.length);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setMessage("");
    setSummary(null);

    try {
      const nextParsed = await parseImportFile(file);
      setParsed(nextParsed);
      setMapping(suggestImportMapping(nextParsed.headers));
      setMessage(`${nextParsed.rows.length} lead rows found. Review the column mapping before importing.`);
    } catch (err) {
      setParsed(null);
      setMapping({});
      setError(err instanceof Error ? err.message : "We could not read that file.");
    } finally {
      event.target.value = "";
    }
  }

  async function importRows() {
    if (!parsed) return;
    setImporting(true);
    setSummary(null);

    const result: ImportSummary = {
      totalRows: parsed.rows.length,
      imported: 0,
      updated: 0,
      duplicatesSkipped: 0,
      failed: []
    };

    for (const row of preparedRows) {
      if (row.errors.length) {
        result.failed.push({ rowNumber: row.rowNumber, reason: row.errors.join(" ") });
        continue;
      }

      if (row.duplicate) {
        if (duplicateMode === "skip" || (duplicateMode === "update" && !row.duplicate.existingLeadId)) {
          result.duplicatesSkipped += 1;
          continue;
        }

        if (duplicateMode === "update" && row.duplicate.existingLeadId) {
          await updateLead(row.duplicate.existingLeadId, row.input);
          result.updated += 1;
          continue;
        }
      }

      const imported = await addLead(row.input);
      if (imported) result.imported += 1;
      else result.failed.push({ rowNumber: row.rowNumber, reason: "LeadLoop could not save this row." });
    }

    setImporting(false);
    setSummary(result);
    if (!result.failed.length) {
      setParsed(null);
      setMapping({});
      setMessage("Import complete.");
    }
  }

  return (
    <AppShell>
      <PageHeader title="Import Leads" kicker="Bulk lead intake" />

      <section className="app-card mb-6 p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h2 className="text-lg font-black text-[#08090A]">Upload your lead sheet</h2>
            <p className="mt-1 text-sm text-[#687184]">
              Upload your existing lead sheet and LeadLoop will help map your columns.
            </p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#8A94A6]">
              Accepted file types: .csv and .xlsx
            </p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#D8CCBD] bg-[#F3EADC]/45 p-8 text-center font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50">
              <FileUp size={26} />
              <span>Choose CSV or Excel file</span>
              <span className="text-xs font-semibold text-[#8A94A6]">First row should contain column headers.</span>
              <input type="file" accept=".csv,text/csv,.xlsx" className="sr-only" onChange={handleFile} />
            </label>
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(sampleCsv)}`}
              download="leadloop-sample-import.csv"
              className="btn-secondary mt-3"
            >
              <Download size={16} />
              Download sample CSV
            </a>
            {error && <Notice tone="red" text={error} />}
            {message && <Notice tone="blue" text={message} />}
          </div>

          <div className="app-card-soft p-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-[#2563EB]" />
              <h3 className="font-black text-[#08090A]">How import works</h3>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[#687184]">
              <Step number="1" title="Upload" body="Add a CSV or Excel file exported from your spreadsheet." />
              <Step number="2" title="Map" body="LeadLoop suggests fields, and you can change anything before saving." />
              <Step number="3" title="Preview" body="Check the first rows, invalid rows, and possible duplicates." />
              <Step number="4" title="Import" body="Only valid rows are saved to the current workspace." />
            </div>
          </div>
        </div>
      </section>

      {parsed && (
        <div className="grid gap-6">
          <section className="app-card p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-[#08090A]">Map columns</h2>
                <p className="text-sm text-[#687184]">
                  Match spreadsheet columns to LeadLoop fields. Unmapped columns are ignored.
                </p>
              </div>
              <span className="status-pill bg-blue-50 text-blue-700">{parsed.rows.length} rows found</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {parsed.headers.map((header) => (
                <label key={header} className="block rounded-xl border border-[#D8CCBD]/70 bg-white p-3 text-sm font-bold text-slate-700">
                  <span className="block truncate">{header}</span>
                  <select
                    className="field-control mt-2"
                    value={mapping[header] || "ignore"}
                    onChange={(event) => setMapping((current) => ({ ...current, [header]: event.target.value as ImportMapping[string] }))}
                  >
                    {IMPORT_FIELD_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </section>

          <section className="app-card p-5">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black text-[#08090A]">Preview and warnings</h2>
                <p className="text-sm text-[#687184]">
                  First 10 mapped rows. Rows need a lead name or phone number.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="status-pill bg-emerald-50 text-emerald-700">{validRows.length} valid</span>
                <span className="status-pill bg-amber-50 text-amber-700">{duplicateRows.length} duplicates</span>
                <span className="status-pill bg-red-50 text-red-700">{invalidRows.length} invalid</span>
              </div>
            </div>

            {duplicateRows.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-2">
                  <AlertTriangle size={18} className="mt-0.5 text-amber-700" />
                  <div>
                    <p className="font-black text-amber-900">Duplicates found</p>
                    <p className="text-sm text-amber-800">LeadLoop checks phone number first, then email.</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm font-bold text-amber-950 sm:grid-cols-3">
                  <DuplicateChoice value="skip" current={duplicateMode} onChange={setDuplicateMode} label="Skip duplicate" />
                  <DuplicateChoice value="update" current={duplicateMode} onChange={setDuplicateMode} label="Update existing lead" />
                  <DuplicateChoice value="import" current={duplicateMode} onChange={setDuplicateMode} label="Import anyway" />
                </div>
              </div>
            )}

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[#F3EADC]/55 text-xs uppercase tracking-wide text-[#687184]">
                  <tr>
                    <th className="px-3 py-2">Row</th>
                    <th className="px-3 py-2">Lead</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">Requirement</th>
                    <th className="px-3 py-2">Stage</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {preparedRows.slice(0, 10).map((row) => (
                    <tr key={row.rowNumber} className={row.errors.length ? "bg-red-50/40" : row.duplicate ? "bg-amber-50/35" : ""}>
                      <td className="px-3 py-2 font-bold text-[#687184]">{row.rowNumber}</td>
                      <td className="px-3 py-2 font-black text-[#08090A]">{row.input.fullName || "Not set"}</td>
                      <td className="px-3 py-2 text-[#687184]">{row.input.phone || "Not set"}</td>
                      <td className="px-3 py-2 text-[#687184]">{row.input.email || "Not set"}</td>
                      <td className="px-3 py-2 text-[#687184]">{row.input.company || "Not set"}</td>
                      <td className="px-3 py-2 text-[#687184]">{row.input.jobInterest || "Not set"}</td>
                      <td className="px-3 py-2 text-[#687184]">{row.input.stage}</td>
                      <td className="px-3 py-2">
                        {row.errors.length ? (
                          <span className="status-pill bg-red-50 text-red-700">{row.errors[0]}</span>
                        ) : row.duplicate ? (
                          <span className="status-pill bg-amber-50 text-amber-700">Duplicate {row.duplicate.kind}</span>
                        ) : (
                          <span className="status-pill bg-emerald-50 text-emerald-700">Ready</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[#687184]">
                {preparedRows.length > 10 ? `Showing 10 of ${preparedRows.length} rows.` : `${preparedRows.length} rows ready for review.`}
              </p>
              <button disabled={!preparedRows.length || importing} onClick={importRows} className="btn-primary disabled:opacity-50">
                {importing ? "Importing..." : "Import valid leads"}
              </button>
            </div>
          </section>
        </div>
      )}

      {summary && (
        <section className="app-card mt-6 p-5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <h2 className="text-lg font-black text-[#08090A]">Import summary</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Total rows found" value={summary.totalRows} />
            <SummaryCard label="Leads imported" value={summary.imported} />
            <SummaryCard label="Leads updated" value={summary.updated} />
            <SummaryCard label="Duplicates skipped" value={summary.duplicatesSkipped} />
            <SummaryCard label="Rows failed" value={summary.failed.length} />
          </div>
          {summary.failed.length > 0 && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-black text-red-900">Failure reasons</p>
              <ul className="mt-2 space-y-1 text-sm font-semibold text-red-800">
                {summary.failed.slice(0, 8).map((failure) => (
                  <li key={`${failure.rowNumber}-${failure.reason}`}>Row {failure.rowNumber}: {failure.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-[#2563EB]">{number}</span>
      <span>
        <strong className="block text-[#08090A]">{title}</strong>
        {body}
      </span>
    </div>
  );
}

function Notice({ tone, text }: { tone: "blue" | "red"; text: string }) {
  const classes = tone === "blue" ? "bg-blue-50 text-blue-800" : "bg-red-50 text-red-800";
  return <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-bold ${classes}`}>{text}</p>;
}

function DuplicateChoice({
  value,
  current,
  onChange,
  label
}: {
  value: DuplicateMode;
  current: DuplicateMode;
  onChange: (value: DuplicateMode) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white/75 px-3 py-2">
      <input type="radio" checked={current === value} onChange={() => onChange(value)} />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#D8CCBD]/70 bg-white p-4">
      <p className="text-2xl font-black text-[#08090A]">{value}</p>
      <p className="text-sm font-bold text-[#687184]">{label}</p>
    </div>
  );
}
