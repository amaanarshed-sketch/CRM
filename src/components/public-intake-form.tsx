"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, CheckCircle2 } from "lucide-react";
import { useApp } from "./app-provider";

export function PublicIntakeForm() {
  const params = useParams<{ agencyId: string }>();
  const { ready, allAgencies, addLead } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const agency = useMemo(
    () => allAgencies.find((item) => item.id === params.agencyId),
    [allAgencies, params.agencyId]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const lead = await addLead(
      {
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        company: "",
        location: String(form.get("location") || ""),
        jobInterest: String(form.get("jobInterest") || ""),
        experience: String(form.get("experience") || ""),
        notes: String(form.get("notes") || ""),
        stage: "New",
        documentStatus: "Not requested",
        source: "Public intake form"
      },
      params.agencyId
    );
    setSubmitting(false);
    if (lead) setSubmitted(true);
    else setError("We could not submit the form. Please try again.");
  }

  if (!ready) return <div className="grid min-h-screen place-items-center text-slate-500">Loading form...</div>;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#2563EB] text-white">
            <Activity size={22} />
          </span>
          <div>
            <p className="font-black text-[#08090A]">{agency?.name || "LeadLoop"}</p>
            <p className="text-sm text-[#687184]">Lead intake form</p>
          </div>
        </div>

        {!agency ? (
          <section className="app-card p-8 text-center">
            <p className="font-bold text-[#687184]">This intake link is not available in this browser workspace.</p>
          </section>
        ) : submitted ? (
          <section className="app-card border-emerald-200 p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={38} />
            <h1 className="mt-3 text-2xl font-black text-[#08090A]">Thanks, your details were received.</h1>
            <p className="mt-2 text-[#687184]">The team can now follow up from their dashboard.</p>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="app-card grid gap-4 p-5">
            <div>
              <p className="eyebrow">New inquiry</p>
              <h1 className="mt-1 text-2xl font-black text-[#08090A]">Tell us what you are interested in</h1>
              <p className="mt-1 text-sm text-[#687184]">Share a few details and the team will follow up with you.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field name="fullName" label="Full name" required />
              <Field name="phone" label="Phone" required />
              <Field name="email" label="Email" type="email" />
              <Field name="location" label="Location" />
              <Field name="jobInterest" label="Interest" required />
              <Field name="experience" label="Context" />
            </div>
            <label className="block text-sm font-bold text-slate-700">
              Notes
              <textarea className="field-control mt-1 min-h-28" name="notes" placeholder="Anything the team should know before reaching out?" />
            </label>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}
            <button disabled={submitting} className="btn-primary disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit details"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input className="field-control mt-1" name={name} type={type} required={required} />
    </label>
  );
}
