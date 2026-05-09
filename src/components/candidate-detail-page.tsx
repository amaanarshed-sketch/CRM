"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Siren } from "lucide-react";
import { formatDate, isCandidateStale, needsFollowUp } from "@/lib/candidate-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { CandidateForm } from "./candidate-form";
import { GenerateMessageButton } from "./message-generator";

export function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { agency, candidates, updateCandidate, deleteCandidate } = useApp();
  const candidate = candidates.find((item) => item.id === params.id);
  const stale = candidate && isCandidateStale(candidate, agency?.staleThresholdDays || 7);
  const due = candidate && needsFollowUp(candidate);

  return (
    <AppShell>
      <PageHeader
        title={candidate?.fullName || "Lead not found"}
        kicker="Lead detail"
        action={
          <div className="flex flex-wrap gap-2">
            {candidate && <GenerateMessageButton candidate={candidate} />}
            <Link href="/candidates" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50">
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>
        }
      />

      {!candidate ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="font-bold text-slate-700">This lead is not in the current workspace.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <section className="grid gap-4 md:grid-cols-3">
            <SignalCard icon={<CalendarClock size={20} />} title="Follow-up" value={due ? "Due now" : formatDate(candidate.nextFollowUpDate)} active={Boolean(due)} />
            <SignalCard icon={<Siren size={20} />} title="Stale status" value={stale ? "Stale lead" : "Not stale"} active={Boolean(stale)} />
            <SignalCard title="Pipeline stage" value={candidate.stage} />
          </section>

          <CandidateForm candidate={candidate} onSave={(input) => updateCandidate(candidate.id, input)} />

          <div className="flex justify-end">
            <button
              onClick={() => {
                deleteCandidate(candidate.id);
                router.push("/candidates");
              }}
              className="rounded-lg border border-rose-200 px-4 py-2 font-bold text-rose-700 hover:bg-rose-50"
            >
              Delete lead
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function SignalCard({ title, value, icon, active }: { title: string; value: string; icon?: React.ReactNode; active?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 shadow-sm ${active ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}
