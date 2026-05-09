"use client";

import { FormEvent, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";

export function SettingsPage() {
  const { agency, staffMembers, updateAgency, replaceStaff } = useApp();
  const [saved, setSaved] = useState("");
  const intakeUrl = useMemo(() => {
    if (typeof window === "undefined" || !agency) return "";
    return `${window.location.origin}/intake/${agency.id}`;
  }, [agency]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await updateAgency({
      name: String(form.get("agencyName") || agency?.name || ""),
      staleThresholdDays: Number(form.get("staleThresholdDays") || 7),
      defaultFollowUpDays: Number(form.get("defaultFollowUpDays") || 2)
    });
    await replaceStaff(String(form.get("staffNames") || "").split("\n"));
    setSaved("Settings saved.");
  }

  return (
    <AppShell>
      <PageHeader title="Settings" kicker="Agency defaults" />
      <form onSubmit={handleSubmit} className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <Field name="agencyName" label="Agency name" defaultValue={agency?.name || ""} />
          <Field name="staleThresholdDays" label="Default stale threshold in days" type="number" defaultValue={String(agency?.staleThresholdDays || 7)} />
          <Field name="defaultFollowUpDays" label="Default follow-up timing in days" type="number" defaultValue={String(agency?.defaultFollowUpDays || 2)} />
        </div>
        <label className="block text-sm font-bold text-slate-700">
          Staff names
          <textarea
            className="focus-ring mt-1 min-h-32 w-full rounded-lg border border-slate-200 px-3 py-2"
            name="staffNames"
            defaultValue={staffMembers.map((staff) => staff.name).join("\n")}
          />
        </label>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-900">Public intake form link</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={intakeUrl} className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" />
            <button type="button" onClick={() => navigator.clipboard?.writeText(intakeUrl)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 hover:bg-white">
              <Copy size={16} />
              Copy
            </button>
          </div>
        </div>
        {saved && <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">{saved}</p>}
        <div className="flex justify-end">
          <button className="rounded-lg bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800">Save settings</button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ name, label, type = "text", defaultValue }: { name: string; label: string; type?: string; defaultValue: string }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" name={name} type={type} defaultValue={defaultValue} min={type === "number" ? 1 : undefined} />
    </label>
  );
}
