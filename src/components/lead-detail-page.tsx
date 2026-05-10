"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, CalendarClock, Mail, MapPin, Phone, Siren, UserRound } from "lucide-react";
import { formatDate, isLeadStale, needsFollowUp } from "@/lib/lead-utils";
import { useApp } from "./app-provider";
import { AppShell, PageHeader } from "./app-shell";
import { LeadForm } from "./lead-form";
import { GenerateMessageButton } from "./message-generator";

export function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { agency, leads, updateLead, deleteLead } = useApp();
  const lead = leads.find((item) => item.id === params.id);
  const stale = lead && isLeadStale(lead, agency?.staleThresholdDays || 7);
  const due = lead && needsFollowUp(lead);

  return (
    <AppShell>
      <PageHeader
        title={lead?.fullName || "Lead not found"}
        kicker="Lead detail"
        action={
          <div className="flex flex-wrap gap-2">
            {lead && <GenerateMessageButton lead={lead} />}
            <Link href="/leads" className="btn-secondary">
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>
        }
      />

      {!lead ? (
        <div className="app-card p-8 text-center">
          <p className="font-bold text-[#687184]">This lead is not in the current workspace.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <section className="grid gap-4 md:grid-cols-3">
            <SignalCard icon={<CalendarClock size={20} />} title="Follow-up" value={due ? "Due now" : formatDate(lead.nextFollowUpDate)} active={Boolean(due)} />
            <SignalCard icon={<Siren size={20} />} title="Stale status" value={stale ? "Stale lead" : "Not stale"} active={Boolean(stale)} />
            <SignalCard title="Pipeline stage" value={lead.stage} />
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="app-card p-5">
              <p className="eyebrow">Lead overview</p>
              <h2 className="mt-1 text-xl font-black text-[#08090A]">{lead.jobInterest || "No interest added"}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem icon={<Phone size={17} />} label="Phone" value={lead.phone || "Not set"} />
                <InfoItem icon={<Mail size={17} />} label="Email" value={lead.email || "Not set"} />
                <InfoItem icon={<Building2 size={17} />} label="Company" value={lead.company || "Not set"} />
                <InfoItem icon={<MapPin size={17} />} label="Location" value={lead.location || "Not set"} />
                <InfoItem icon={<UserRound size={17} />} label="Assigned staff" value={lead.assignedStaff || "Unassigned"} />
              </div>
            </div>

            <div className="app-card-soft p-5">
              <p className="eyebrow">Follow-up info</p>
              <dl className="mt-3 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#687184]">Last contacted</dt>
                  <dd className="font-black text-[#08090A]">{formatDate(lead.lastContactedDate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#687184]">Next follow-up</dt>
                  <dd className="font-black text-[#08090A]">{formatDate(lead.nextFollowUpDate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#687184]">Info status</dt>
                  <dd className="status-pill bg-white text-[#687184]">{lead.documentStatus}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="font-bold text-[#687184]">Source</dt>
                  <dd className="font-black text-[#08090A]">{lead.source || "Not set"}</dd>
                </div>
              </dl>
            </div>
          </section>

          <LeadForm lead={lead} onSave={(input) => updateLead(lead.id, input)} />

          <div className="flex justify-end">
            <button
              onClick={() => {
                deleteLead(lead.id);
                router.push("/leads");
              }}
              className="rounded-lg border border-rose-200 bg-white px-4 py-2 font-bold text-rose-700 hover:bg-rose-50"
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
    <div className={`app-card p-4 ${active ? "border-amber-200 bg-amber-50" : ""}`}>
      <div className="flex items-center gap-2 text-sm font-bold text-[#687184]">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-xl font-black text-[#08090A]">{value}</p>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#D8CCBD]/70 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#8A94A6]">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-bold text-[#08090A]">{value}</p>
    </div>
  );
}
