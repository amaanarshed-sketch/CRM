"use client";

import { useState } from "react";
import { Copy, MessageSquare, Wand2, X } from "lucide-react";
import { formatDate } from "@/lib/candidate-utils";
import { Candidate, FollowUpKind } from "@/lib/types";

const messageTypes: FollowUpKind[] = [
  "First follow-up",
  "Document reminder",
  "Interview reminder",
  "No-response follow-up",
  "Stale candidate reactivation",
  "Client feedback pending follow-up",
  "Final soft follow-up"
];

export function GenerateMessageButton({
  candidate,
  label = "Generate Message",
  compact = false
}: {
  candidate: Candidate;
  label?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-lg border border-teal-200 px-2 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50"
            : "inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800"
        }
        aria-label={label}
      >
        <MessageSquare size={compact ? 16 : 18} />
        {compact ? "Message" : label}
      </button>
      <MessageGeneratorModal candidate={candidate} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function MessageGeneratorModal({
  candidate,
  open,
  onClose
}: {
  candidate: Candidate;
  open: boolean;
  onClose: () => void;
}) {
  const [kind, setKind] = useState<FollowUpKind>("First follow-up");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setCopied(false);
    const response = await fetch("/api/follow-up-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate, kind })
    });
    const data = (await response.json()) as { message: string };
    setMessage(data.message);
    setLoading(false);
  }

  async function copyMessage() {
    await navigator.clipboard?.writeText(message);
    setCopied(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <section className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">Generate follow-up message</h2>
            <p className="text-sm text-slate-500">
              Copy-ready WhatsApp/email text only. Nothing is sent automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Close message generator"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mt-4 block text-sm font-bold text-slate-700">
          Message type
          <select
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as FollowUpKind);
              setCopied(false);
            }}
          >
            {messageTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <span className="rounded-lg bg-slate-50 px-3 py-2">Stage: {candidate.stage}</span>
          <span className="rounded-lg bg-slate-50 px-3 py-2">Docs: {candidate.documentStatus}</span>
          <span className="rounded-lg bg-slate-50 px-3 py-2">Next: {formatDate(candidate.nextFollowUpDate)}</span>
        </div>
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Last contacted: {formatDate(candidate.lastContactedDate)}
        </div>

        <textarea
          className="focus-ring mt-4 min-h-44 w-full rounded-lg border border-slate-200 p-3"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setCopied(false);
          }}
          placeholder="Choose a message type, then generate copy-ready text..."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            <Wand2 size={17} />
            {loading ? "Generating..." : message ? "Regenerate" : "Generate"}
          </button>
          <button
            type="button"
            onClick={copyMessage}
            disabled={!message}
            className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Copy size={17} />
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="text-xs font-semibold text-slate-500">Editable before copying. No automatic sending.</span>
        </div>
      </section>
    </div>
  );
}
