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
    <section className="app-card overflow-hidden">
      {showFilters && (
        <div className="flex flex-col gap-3 border-b border-[#D8CCBD]/70 bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block md:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A94A6]" size={18} />
            <input
              className="field-control py-2 pl-10 pr-3"
              placeholder="Search leads, interest, phone, staff..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="field-control md:w-56"
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
          <thead className="bg-[#F3EADC]/55 text-xs uppercase tracking-wide text-[#687184]">
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
                <tr key={candidate.id} className={`transition hover:bg-[#EFF6FF]/50 ${stale ? "bg-red-50/25" : due ? "bg-amber-50/35" : ""}`}>
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${candidate.id}`} className="font-black text-[#08090A] hover:text-[#2563EB]">
                      {candidate.fullName || "Unnamed lead"}
                    </Link>
                    <p className="text-xs text-[#8A94A6]">{candidate.email || "No email"}</p>
                  </td>
                  <td className="px-4 py-3 text-[#687184]">{candidate.phone || "Not set"}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{candidate.jobInterest || "Not set"}</td>
                  <td className="px-4 py-3">
                    <select
                      className={`focus-ring rounded-full border px-2.5 py-1 text-xs font-black ${getStageTone(candidate.stage)}`}
                      value={candidate.stage}
                      onChange={(event) => updateCandidate(candidate.id, { stage: event.target.value as PipelineStage })}
                    >
                      {PIPELINE_STAGES.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[#687184]">{candidate.assignedStaff || "Unassigned"}</td>
                  <td className="px-4 py-3">
                    <input
                      className="field-control w-36 px-2 py-1 text-xs"
                      type="date"
                      value={candidate.lastContactedDate}
                      onChange={(event) => updateCandidate(candidate.id, { lastContactedDate: event.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className={`field-control w-36 px-2 py-1 text-xs ${due ? "border-amber-300 bg-amber-50 font-bold text-amber-900" : ""}`}
                      type="date"
                      value={candidate.nextFollowUpDate}
                      onChange={(event) => updateCandidate(candidate.id, { nextFollowUpDate: event.target.value })}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="status-pill text-[#687184]">{candidate.documentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-pill ${stale ? "border-red-200 bg-red-50 text-red-700" : due ? "border-amber-200 bg-amber-50 text-amber-800" : "text-[#687184]"}`}>
                      {stale ? "Stale" : "Healthy"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/candidates/${candidate.id}`} className="btn-secondary p-2" aria-label="View lead">
                        <Eye size={16} />
                      </Link>
                      <GenerateMessageButton candidate={candidate} label="Message" compact />
                      <button onClick={() => updateCandidate(candidate.id, { stage: "Won", nextFollowUpDate: "" })} className="rounded-lg border border-emerald-200 bg-white p-2 text-emerald-700 hover:bg-emerald-50" aria-label="Mark won">
                        <CheckCircle2 size={16} />
                      </button>
                      <button onClick={() => updateCandidate(candidate.id, { stage: "Lost", nextFollowUpDate: "" })} className="rounded-lg border border-rose-200 bg-white p-2 text-rose-700 hover:bg-rose-50" aria-label="Mark lost">
                        <XCircle size={16} />
                      </button>
                      <button onClick={() => updateCandidate(candidate.id, { lastContactedDate: todayISO() })} className="btn-secondary px-2 py-2 text-xs">
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
        <div className="p-6">
          <div className="empty-state">
            <p className="font-black text-slate-800">{rows.length ? "No matching leads" : "No leads yet"}</p>
            <p className="mt-1 text-sm text-[#687184]">
              {rows.length ? "Try a different search term or stage filter." : "Add your first lead or import a CSV to start tracking follow-ups."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
