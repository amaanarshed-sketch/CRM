"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { LeadForm } from "./lead-form";
import { LeadTable } from "./lead-table";

export function LeadsPage() {
  const { leads, addLead } = useApp();
  const [adding, setAdding] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Leads"
        kicker="Lead database"
        action={
          <button onClick={() => setAdding((value) => !value)} className="btn-primary">
            <Plus size={18} />
            {adding ? "Close form" : "Add lead"}
          </button>
        }
      />
      {adding && (
        <div className="fade-slide-in mb-6">
          <LeadForm
            submitLabel="Create lead"
            onSave={(input) => {
              addLead(input);
              setAdding(false);
            }}
          />
        </div>
      )}
      <LeadTable rows={leads} />
    </AppShell>
  );
}
