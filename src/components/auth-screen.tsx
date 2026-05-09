"use client";

import { FormEvent, useState } from "react";
import { Activity, ArrowRight, LockKeyhole } from "lucide-react";
import { useApp } from "./app-provider";

export function AuthScreen() {
  const { login, signup, startDemo } = useApp();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") || ""),
      agencyName: String(form.get("agencyName") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || "")
    };
    const result =
      mode === "signup"
        ? signup(payload)
        : login(payload.email, payload.password);
    const resolved = await result;
    setError(resolved.ok ? "" : resolved.message);
    setLoading(false);
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="hidden lg:flex flex-col justify-between p-12 bg-[#101828] text-white">
        <div className="flex items-center gap-3 font-bold">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-500 text-white">
            <Activity size={22} />
          </span>
          LeadLoop
        </div>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">Sales follow-up control</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight">
            Track every lead before the opportunity goes cold.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            A lightweight CRM for follow-ups, notes, assigned staff, stale leads, and won or lost outcomes.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 p-4">
            <strong className="block text-white">Due today</strong>
            Sorted by oldest follow-up first.
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <strong className="block text-white">Stale alerts</strong>
            Based on your workspace threshold.
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <strong className="block text-white">Copy-ready messages</strong>
            Generated, never auto-sent.
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">{mode === "signup" ? "Create workspace" : "Log in"}</h2>
              <p className="text-sm text-slate-500">Workspace data stays scoped to the signed-in account.</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
            <button type="button" onClick={() => setMode("signup")} className={`rounded-md px-3 py-2 ${mode === "signup" ? "bg-white shadow-sm" : "text-slate-500"}`}>
              Sign up
            </button>
            <button type="button" onClick={() => setMode("login")} className={`rounded-md px-3 py-2 ${mode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`}>
              Log in
            </button>
          </div>

          {mode === "signup" && (
            <>
              <Field name="fullName" label="Your name" />
              <Field name="agencyName" label="Workspace name" />
            </>
          )}
          <Field name="email" label="Email" type="email" />
          <Field name="password" label="Password" type="password" />

          {error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

          <button disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-60">
            {loading ? "Working..." : mode === "signup" ? "Open dashboard" : "Log in"}
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={startDemo}
            className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
          >
            Try demo workspace
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <label className="mb-4 block text-sm font-semibold text-slate-700">
      {label}
      <input
        className="focus-ring mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-950"
        name={name}
        type={type}
        autoComplete={name}
      />
    </label>
  );
}
