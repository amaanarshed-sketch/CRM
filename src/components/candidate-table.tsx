"use client";

import Link from "next/link";
import { CheckCircle2, Eye, Search, XCircle } from "lucide-react";
import {
  formatDate,
  getStageTone,
  isCandidateStale,
  needsFollowUp,
  todayISO
} from "@/lib/candidate-utils";
import { Candidate, PIPELINE_STAGES, PipelineStage } from "@/lib/types";
import { useApp } from "./app-provider";
import { useMemo, useState } from "react";
import { GenerateMessageButton } from "./message-generator";

type Props = {
  rows: Candidate[];
  showFilters?: boolean;
};

export function CandidateTable({ rows, showFilters = true }: Props) {
  const { agency, updateCandidate } = useApp();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All");
  const staleThreshold = agency?.staleThresholdDays || 7;

  const filteredRows = useMemo(() => {
    return rows.filter((candidate) => {
      const haystack = [
        candidate.fullName,
        candidate.phone,
        candidate.email,
        candidate.jobInterest,
        candidate.assignedStaff,
        candidate.stage,
        candidate.documentStatus
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesStage = stage === "All" || candidate.stage === stage;
      return matchesQuery && matchesStage;
    });
  }, [query, rows, stage]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {showFilters && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block md:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="focus-ring w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3"
              placeholder="Search leads, interest, phone, staff..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold"
            value={stage}
            onChange={(event) => setStage(event.target.value)}
          >
            <option>All</option>
            {PIPELINE_STAGES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Interest</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Assigned staff</th>
              <th className="px-4 py-3">Last contacted</th>
              <th className="px-4 py-3">Next follow-up</th>
              <th className="px-4 py-3">Info status</th>
              <th className="px-4 py-3">Stale</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((candidate) => {
              const stale = isCandidateStale(candidate, staleThreshold);
              const due = needsFollowUp(candidate);
              return (
                <tr key={candidate.id} className={stale || due ? "bg-amber-50/40" : undefined}>
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${candidate.id}`} className="font-black text-slate-950 hover:text-teal-700">
                      {candidate.fullName || "Unnamed lead"}
                    </Link>
                    <p className="text-xs text-slate-500">{candidate.email || "No email"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{candidate.phone || "Not set"}</td>
                  <td className="px-4 py-3 text-slate-700">{candidate.jobInterest || "Not set"}</td>
                  <td className="px-4 py-3">
                    <select
                      className={`focus-ring rounded-lg border px-2 py-1 text-xs font-black ${getStageTone(candidate.stage)}`}
                      value={candidate.stage}
                      onChange={(event) => updateCandidate(candidate.id, { stage: event.target.value as PipelineStage })}
                    >
                      {PIPELINE_STAGES.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{candidate.assignedStaff || "Unassigned"}</td>
                  <td className="px-4 py-3">
                    <input
                      className="focus-ring w-36 rounded-lg border border-slate-200 px-2 py-1"
                      type="date"
                      value={candidate.lastContactedDate}
                      onChange={(event) => updateCandidate(candidate.id, { lastContactedDate: event.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className={`focus-ring w-36 rounded-lg border px-2 py-1 ${due ? "border-amber-300 bg-amber-50 font-bold text-amber-900" : "border-slate-200"}`}
                      type="date"
                      value={candidate.nextFollowUpDate}
                      onChange={(event) => updateCandidate(candidate.id, { nextFollowUpDate: event.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{candidate.documentStatus}</td>
                  <td className="px-4 py-3">
                    <span className={`status-pill ${stale ? "border-amber-200 bg-amber-50 text-amber-800" : "text-slate-500"}`}>
                      {stale ? "Stale" : "Healthy"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/candidates/${candidate.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="View lead">
                        <Eye size={16} />
                      </Link>
                      <GenerateMessageButton candidate={candidate} label="Message" compact />
                      <button onClick={() => updateCandidate(candidate.id, { stage: "Won", nextFollowUpDate: "" })} className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50" aria-label="Mark won">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => updateCandidate(candidate.id, { stage: "Lost", nextFollowUpDate: "" })} className="rounded-lg border border-rose-200 p-2 text-rose-700 hover:bg-rose-50" aria-label="Mark lost">
                        <XCircle size={16} />
                      </button>
                      <button onClick={() => updateCandidate(candidate.id, { lastContactedDate: todayISO() })} className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                        Contacted
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!filteredRows.length && (
        <div className="p-8 text-center">
          <p className="font-bold text-slate-700">No leads found.</p>
          <p className="text-sm text-slate-500">Add a lead or adjust your filters.</p>
        </div>
      )}
    </section>
  );
}
