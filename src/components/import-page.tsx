"use client";

import { ChangeEvent, useState } from "react";
import { FileUp } from "lucide-react";
import { parseLeadCSV } from "@/lib/csv";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { LeadTable } from "./lead-table";

export function ImportPage() {
  const { importLeads } = useApp();
  const [preview, setPreview] = useState<ReturnType<typeof parseLeadCSV>>([]);
  const [message, setMessage] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseLeadCSV(text);
    setPreview(rows);
    setMessage(`${rows.length} lead rows ready to import.`);
  }

  return (
    <AppShell>
      <PageHeader title="Import CSV" kicker="Bulk lead intake" />
      <section className="app-card mb-6 p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-lg font-black text-[#08090A]">Upload lead CSV</h2>
            <p className="mt-1 text-sm text-[#687184]">
              Supported headers: full_name, phone, email, source, interest, location, assigned_staff, stage,
              last_contacted_date, next_follow_up_date, info_status, notes.
            </p>
            <label className="mt-4 flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#D8CCBD] bg-[#F3EADC]/45 p-8 text-center font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50">
              <FileUp size={22} />
              Choose CSV file
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={handleFile} />
            </label>
            {message && <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">{message}</p>}
          </div>
          <div className="rounded-xl bg-[#F3EADC]/55 p-4 text-sm text-[#687184]">
            <p className="font-black text-[#08090A]">Example header</p>
            <code className="mt-2 block overflow-x-auto rounded-lg bg-white p-3 text-xs text-slate-700">
              full_name,phone,email,source,interest,location,assigned_staff,stage,last_contacted_date,next_follow_up_date,info_status,notes
            </code>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            disabled={!preview.length}
            onClick={async () => {
              const count = await importLeads(preview);
              setPreview([]);
              setMessage(`Imported ${count} leads.`);
            }}
            className="btn-primary disabled:opacity-50"
          >
            Import leads
          </button>
        </div>
      </section>
      {preview.length > 0 && <LeadTable rows={preview.map((lead, index) => ({ ...lead, id: `preview-${index}`, agencyId: "preview", createdAt: "", updatedAt: "" }))} />}
    </AppShell>
  );
}
