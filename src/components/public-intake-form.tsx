"use client";

import { FormEvent, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Activity, CheckCircle2 } from "lucide-react";
import { useApp } from "./app-provider";

export function PublicIntakeForm() {
  const params = useParams<{ agencyId: string }>();
  const { ready, allAgencies, addCandidate } = useApp();
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
    const candidate = await addCandidate(
      {
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
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
    if (candidate) setSubmitted(true);
    else setError("We could not submit the form. Please try again.");
  }

  if (!ready) return <div className="grid min-h-screen place-items-center text-slate-500">Loading form...</div>;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-700 text-white">
            <Activity size={22} />
          </span>
          <div>
            <p className="font-black text-slate-950">{agency?.name || "LeadLoop"}</p>
            <p className="text-sm text-slate-500">Lead intake form</p>
          </div>
        </div>

        {!agency ? (
          <section className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="font-bold text-slate-700">This intake link is not available in this browser workspace.</p>
          </section>
        ) : submitted ? (
          <section className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto text-emerald-600" size={38} />
            <h1 className="mt-3 text-2xl font-black text-slate-950">Thanks, your details were received.</h1>
            <p className="mt-2 text-slate-500">The team can now follow up from their dashboard.</p>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-black text-slate-950">Tell us what you are interested in</h1>
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
              <textarea className="focus-ring mt-1 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-2" name="notes" />
            </label>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}
            <button disabled={submitting} className="rounded-lg bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800 disabled:opacity-60">
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
      <input className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" name={name} type={type} required={required} />
    </label>
  );
}
