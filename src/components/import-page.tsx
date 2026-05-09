"use client";

import { ChangeEvent, useState } from "react";
import { FileUp } from "lucide-react";
import { parseCandidateCSV } from "@/lib/csv";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { CandidateTable } from "./candidate-table";

export function ImportPage() {
  const { importCandidates } = useApp();
  const [preview, setPreview] = useState<ReturnType<typeof parseCandidateCSV>>([]);
  const [message, setMessage] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCandidateCSV(text);
    setPreview(rows);
    setMessage(`${rows.length} candidate rows ready to import.`);
  }

  return (
    <AppShell>
      <PageHeader title="Import CSV" kicker="Bulk candidate intake" />
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-lg font-black text-slate-950">Upload candidate CSV</h2>
            <p className="mt-1 text-sm text-slate-500">
              Supported headers: full_name, phone, email, source, job_interest, location, assigned_staff, stage,
              last_contacted_date, next_follow_up_date, document_status, notes.
            </p>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50">
              <FileUp size={22} />
              Choose CSV file
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
            </label>
            {message && <p className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">{message}</p>}
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-black text-slate-900">Example header</p>
            <code className="mt-2 block overflow-x-auto rounded-lg bg-white p-3 text-xs">
              full_name,phone,email,source,job_interest,location,assigned_staff,stage,last_contacted_date,next_follow_up_date,document_status,notes
            </code>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            disabled={!preview.length}
            onClick={async () => {
              const count = await importCandidates(preview);
              setPreview([]);
              setMessage(`Imported ${count} candidates.`);
            }}
            className="rounded-lg bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800 disabled:opacity-50"
          >
            Import candidates
          </button>
        </div>
      </section>
      {preview.length > 0 && <CandidateTable rows={preview.map((candidate, index) => ({ ...candidate, id: `preview-${index}`, agencyId: "preview", createdAt: "", updatedAt: "" }))} />}
    </AppShell>
  );
}
