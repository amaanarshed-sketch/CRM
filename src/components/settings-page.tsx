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
      <PageHeader title="Settings" kicker="Workspace defaults" />
      <form onSubmit={handleSubmit} className="app-card grid gap-5 p-5">
        <div>
          <h2 className="text-lg font-black text-[#08090A]">Workspace controls</h2>
          <p className="text-sm text-[#687184]">Set follow-up defaults, stale lead rules, and staff names.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field name="agencyName" label="Workspace name" defaultValue={agency?.name || ""} />
          <Field name="staleThresholdDays" label="Default stale threshold in days" type="number" defaultValue={String(agency?.staleThresholdDays || 7)} />
          <Field name="defaultFollowUpDays" label="Default follow-up timing in days" type="number" defaultValue={String(agency?.defaultFollowUpDays || 2)} />
        </div>
        <label className="block text-sm font-bold text-slate-700">
          Staff names
          <textarea
            className="field-control mt-1 min-h-32"
            name="staffNames"
            defaultValue={staffMembers.map((staff) => staff.name).join("\n")}
            placeholder="One staff member per line"
          />
        </label>
        <div className="app-card-soft p-4">
          <p className="text-sm font-black text-[#08090A]">Public lead form link</p>
          <p className="mt-1 text-sm text-[#687184]">Share this with leads when you want new inquiries to enter LeadLoop automatically.</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={intakeUrl} className="field-control flex-1 text-sm" />
            <button type="button" onClick={() => navigator.clipboard?.writeText(intakeUrl)} className="btn-secondary">
              <Copy size={16} />
              Copy
            </button>
          </div>
        </div>
        {saved && <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">{saved}</p>}
        <div className="flex justify-end">
          <button className="btn-primary">Save settings</button>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ name, label, type = "text", defaultValue }: { name: string; label: string; type?: string; defaultValue: string }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input className="field-control mt-1" name={name} type={type} defaultValue={defaultValue} min={type === "number" ? 1 : undefined} />
    </label>
  );
}
