"use client";

import { FormEvent } from "react";
import { DOCUMENT_STATUSES, Lead, LeadInput, PIPELINE_STAGES } from "@/lib/types";
import { makeLeadInput } from "@/lib/lead-utils";
import { useApp } from "./app-provider";

type Props = {
  lead?: Lead;
  onSave: (input: LeadInput) => void;
  submitLabel?: string;
};

export function LeadForm({ lead, onSave, submitLabel = "Save lead" }: Props) {
  const { staffMembers } = useApp();
  const initial = makeLeadInput(lead || {});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave(
      makeLeadInput({
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        company: String(form.get("company") || ""),
        source: String(form.get("source") || ""),
        jobInterest: String(form.get("jobInterest") || ""),
        location: String(form.get("location") || ""),
        assignedStaff: String(form.get("assignedStaff") || ""),
        stage: String(form.get("stage") || "New") as LeadInput["stage"],
        lastContactedDate: String(form.get("lastContactedDate") || ""),
        nextFollowUpDate: String(form.get("nextFollowUpDate") || ""),
        documentStatus: String(form.get("documentStatus") || "Not requested") as LeadInput["documentStatus"],
        notes: String(form.get("notes") || ""),
        experience: String(form.get("experience") || "")
      })
    );
  }

  return (
    <form onSubmit={handleSubmit} className="app-card grid gap-5 p-5">
      <div>
        <h2 className="text-lg font-black text-[#08090A]">Lead information</h2>
        <p className="text-sm text-[#687184]">Keep the contact, interest, owner, and next action in one place.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field name="fullName" label="Full name" defaultValue={initial.fullName} required />
        <Field name="phone" label="Phone number" defaultValue={initial.phone} />
        <Field name="email" label="Email" type="email" defaultValue={initial.email} />
        <Field name="company" label="Company" defaultValue={initial.company} />
        <Field name="source" label="Source" defaultValue={initial.source} />
        <Field name="jobInterest" label="Lead interest" defaultValue={initial.jobInterest} />
        <Field name="location" label="Location" defaultValue={initial.location} />
        <label className="block text-sm font-bold text-slate-700">
          Assigned staff
          <input
            className="field-control mt-1"
            name="assignedStaff"
            list="staff-members"
            defaultValue={initial.assignedStaff}
          />
          <datalist id="staff-members">
            {staffMembers.map((staff) => (
              <option key={staff.id} value={staff.name} />
            ))}
          </datalist>
        </label>
        <Select name="stage" label="Pipeline stage" defaultValue={initial.stage} options={PIPELINE_STAGES} />
        <Field name="lastContactedDate" label="Last contacted" type="date" defaultValue={initial.lastContactedDate} />
        <Field name="nextFollowUpDate" label="Next follow-up" type="date" defaultValue={initial.nextFollowUpDate} />
        <Select name="documentStatus" label="Info status" defaultValue={initial.documentStatus} options={DOCUMENT_STATUSES} />
        <Field name="experience" label="Context" defaultValue={initial.experience || ""} />
      </div>
      <label className="block text-sm font-bold text-slate-700">
        Notes
        <textarea
          className="field-control mt-1 min-h-32"
          name="notes"
          defaultValue={initial.notes}
          placeholder="Add context from calls, WhatsApp chats, objections, quote details, or next steps."
        />
      </label>
      <div className="flex justify-end">
        <button className="btn-primary focus-ring">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        className="field-control mt-1"
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: readonly string[];
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <select className="field-control mt-1" name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
