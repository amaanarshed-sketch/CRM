"use client";

import { useState } from "react";
import { Copy, MessageSquare, Wand2, X } from "lucide-react";
import { formatDate } from "@/lib/candidate-utils";
import { Candidate, FollowUpKind } from "@/lib/types";

const messageTypes: FollowUpKind[] = [
  "First follow-up",
  "Appointment reminder",
  "Info request",
  "Proposal follow-up",
  "Reactivation message",
  "Won lead thank-you",
  "Lost lead polite close",
  "No-response follow-up",
  "Stale lead reactivation"
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
            ? "inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50"
            : "btn-primary"
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <section className="app-card w-full max-w-2xl p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Draft only</p>
            <h2 className="mt-1 text-lg font-black text-[#08090A]">Generate follow-up message</h2>
            <p className="text-sm text-[#687184]">
              Creates copy-ready WhatsApp/email text. LeadLoop never sends it automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary p-2 text-[#687184]"
            aria-label="Close message generator"
          >
            <X size={18} />
          </button>
        </div>

        <label className="mt-4 block text-sm font-bold text-slate-700">
          Message type
          <select
            className="field-control mt-1 text-sm font-semibold"
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

        <div className="mt-4 grid gap-3 text-sm text-[#687184] sm:grid-cols-3">
          <span className="rounded-lg bg-[#F3EADC]/65 px-3 py-2">Stage: <strong className="text-slate-800">{candidate.stage}</strong></span>
          <span className="rounded-lg bg-[#F3EADC]/65 px-3 py-2">Info: <strong className="text-slate-800">{candidate.documentStatus}</strong></span>
          <span className="rounded-lg bg-[#F3EADC]/65 px-3 py-2">Next: <strong className="text-slate-800">{formatDate(candidate.nextFollowUpDate)}</strong></span>
        </div>
        <div className="mt-3 rounded-lg bg-[#EFF6FF] px-3 py-2 text-sm text-blue-900">
          Last contacted: {formatDate(candidate.lastContactedDate)}
        </div>

        <textarea
          className="field-control mt-4 min-h-44 p-3"
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
            className="btn-primary focus-ring disabled:opacity-60"
          >
            <Wand2 size={17} />
            {loading ? "Generating..." : message ? "Regenerate" : "Generate"}
          </button>
          <button
            type="button"
            onClick={copyMessage}
            disabled={!message}
            className="btn-secondary focus-ring disabled:opacity-50"
          >
            <Copy size={17} />
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="text-xs font-semibold text-[#8A94A6]">Editable before copying. No automatic sending.</span>
        </div>
      </section>
    </div>
  );
}
