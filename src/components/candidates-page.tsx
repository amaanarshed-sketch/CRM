"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { CandidateForm } from "./candidate-form";
import { CandidateTable } from "./candidate-table";

export function CandidatesPage() {
  const { candidates, addCandidate } = useApp();
  const [adding, setAdding] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Candidates"
        kicker="Pipeline database"
        action={
          <button onClick={() => setAdding((value) => !value)} className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800">
            <Plus size={18} />
            {adding ? "Close form" : "Add candidate"}
          </button>
        }
      />
      {adding && (
        <div className="mb-6">
          <CandidateForm
            submitLabel="Create candidate"
            onSave={(input) => {
              addCandidate(input);
              setAdding(false);
            }}
          />
        </div>
      )}
      <CandidateTable rows={candidates} />
    </AppShell>
  );
}
