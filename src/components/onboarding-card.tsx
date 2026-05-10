"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileUp, FormInput, Settings2 } from "lucide-react";
import { useApp } from "./app-provider";

export function OnboardingCard() {
  const { agency, staffMembers, updateAgency, replaceStaff } = useApp();
  const [saving, setSaving] = useState(false);

  if (!agency || agency.onboardingCompleted) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agency) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    await updateAgency({
      name: String(form.get("agencyName") || agency.name),
      staleThresholdDays: Number(form.get("staleThresholdDays") || 7),
      defaultFollowUpDays: Number(form.get("defaultFollowUpDays") || 2),
      onboardingCompleted: true
    });
    await replaceStaff(String(form.get("staffNames") || "").split("\n"));
    setSaving(false);
  }

  return (
    <section className="app-card glass-panel surface-enter mb-6 p-5">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">First setup</p>
          <h2 className="mt-1 text-2xl font-black text-[#08090A]">Set up your LeadLoop workspace</h2>
          <p className="mt-2 text-sm text-[#687184]">
            Add your team names and stale lead rule now. You can change everything later in Settings.
          </p>
          <div className="mt-4 grid gap-2 text-sm font-bold text-[#263244]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-600" />
              Workspace data stays scoped to your account.
            </div>
            <div className="flex items-center gap-2">
              <FileUp size={17} className="text-[#2563EB]" />
              Import your existing leads after setup.
            </div>
            <div className="flex items-center gap-2">
              <FormInput size={17} className="text-amber-600" />
              Share your intake form to capture new leads.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700">
              Workspace name
              <input className="field-control mt-1" name="agencyName" defaultValue={agency.name} required />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Stale threshold
              <input className="field-control mt-1" name="staleThresholdDays" type="number" min={1} defaultValue={agency.staleThresholdDays} required />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Default follow-up timing
              <input className="field-control mt-1" name="defaultFollowUpDays" type="number" min={1} defaultValue={agency.defaultFollowUpDays} required />
            </label>
          </div>
          <label className="block text-sm font-bold text-slate-700">
            Staff names
            <textarea
              className="field-control mt-1 min-h-28"
              name="staffNames"
              defaultValue={staffMembers.map((staff) => staff.name).join("\n")}
              placeholder="One staff member per line"
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link href="/import" className="btn-secondary text-sm">
                <FileUp size={16} />
                Import leads
              </Link>
              <Link href="/intake" className="btn-secondary text-sm">
                <FormInput size={16} />
                Lead form
              </Link>
            </div>
            <button className="btn-primary" disabled={saving}>
              <Settings2 size={16} />
              {saving ? "Saving..." : "Finish setup"}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
