"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
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
    <main className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#08090A] p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.32),transparent_22rem),radial-gradient(circle_at_82%_78%,rgba(245,158,11,0.18),transparent_18rem)]" />
        <div className="relative flex items-center gap-3 font-bold">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#2563EB] text-white">
            <Activity size={22} />
          </span>
          <span>
            <span className="block text-lg leading-tight">LeadLoop</span>
            <span className="block text-xs text-slate-400">Follow-up CRM</span>
          </span>
        </div>
        <div className="relative max-w-2xl surface-enter">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Sales follow-up control</p>
          <h1 className="mt-5 text-5xl font-black leading-tight">
            Track every lead before the opportunity goes cold.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            A lightweight CRM for teams managing WhatsApp chats, calls, spreadsheets, and memory.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-slate-200 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <strong className="block text-white">Due today</strong>
            Sorted by oldest follow-up first.
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-slate-200 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <strong className="block text-white">Stale alerts</strong>
            Based on your workspace threshold.
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 text-slate-200 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <strong className="block text-white">Copy-ready messages</strong>
            Generated, never auto-sent.
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="app-card glass-panel modal-enter w-full max-w-md p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-950">{mode === "signup" ? "Create workspace" : "Log in"}</h2>
              <p className="text-sm text-[#687184]">Workspace data stays scoped to the signed-in account.</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-xl bg-[#F3EADC]/72 p-1 text-sm font-semibold">
            <button type="button" onClick={() => setMode("signup")} className={`rounded-lg px-3 py-2 transition ${mode === "signup" ? "bg-white text-[#08090A] shadow-sm" : "text-[#687184] hover:text-[#08090A]"}`}>
              Sign up
            </button>
            <button type="button" onClick={() => setMode("login")} className={`rounded-lg px-3 py-2 transition ${mode === "login" ? "bg-white text-[#08090A] shadow-sm" : "text-[#687184] hover:text-[#08090A]"}`}>
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

          <button disabled={loading} className="btn-primary focus-ring w-full disabled:opacity-60">
            {loading ? "Working..." : mode === "signup" ? "Open dashboard" : "Log in"}
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={startDemo}
            className="btn-secondary focus-ring mt-3 w-full"
          >
            Try demo workspace
          </button>
          <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-bold text-[#687184]">
            <Link className="hover:text-[#2563EB]" href="/privacy">Privacy</Link>
            <Link className="hover:text-[#2563EB]" href="/terms">Terms</Link>
            <Link className="hover:text-[#2563EB]" href="/support">Support</Link>
          </div>
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
        className="field-control mt-1"
        name={name}
        type={type}
        autoComplete={name}
      />
    </label>
  );
}
