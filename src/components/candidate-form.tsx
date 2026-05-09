"use client";

import { FormEvent } from "react";
import { DOCUMENT_STATUSES, Candidate, CandidateInput, PIPELINE_STAGES } from "@/lib/types";
import { makeCandidateInput } from "@/lib/candidate-utils";
import { useApp } from "./app-provider";

type Props = {
  candidate?: Candidate;
  onSave: (input: CandidateInput) => void;
  submitLabel?: string;
};

export function CandidateForm({ candidate, onSave, submitLabel = "Save lead" }: Props) {
  const { staffMembers } = useApp();
  const initial = makeCandidateInput(candidate || {});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave(
      makeCandidateInput({
        fullName: String(form.get("fullName") || ""),
        phone: String(form.get("phone") || ""),
        email: String(form.get("email") || ""),
        source: String(form.get("source") || ""),
        jobInterest: String(form.get("jobInterest") || ""),
        location: String(form.get("location") || ""),
        assignedStaff: String(form.get("assignedStaff") || ""),
        stage: String(form.get("stage") || "New") as CandidateInput["stage"],
        lastContactedDate: String(form.get("lastContactedDate") || ""),
        nextFollowUpDate: String(form.get("nextFollowUpDate") || ""),
        documentStatus: String(form.get("documentStatus") || "Not requested") as CandidateInput["documentStatus"],
        notes: String(form.get("notes") || ""),
        experience: String(form.get("experience") || "")
      })
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field name="fullName" label="Full name" defaultValue={initial.fullName} required />
        <Field name="phone" label="Phone number" defaultValue={initial.phone} />
        <Field name="email" label="Email" type="email" defaultValue={initial.email} />
        <Field name="source" label="Source" defaultValue={initial.source} />
        <Field name="jobInterest" label="Lead interest" defaultValue={initial.jobInterest} />
        <Field name="location" label="Location" defaultValue={initial.location} />
        <label className="block text-sm font-bold text-slate-700">
          Assigned staff
          <input
            className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
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
          className="focus-ring mt-1 min-h-32 w-full rounded-lg border border-slate-200 px-3 py-2"
          name="notes"
          defaultValue={initial.notes}
        />
      </label>
      <div className="flex justify-end">
        <button className="focus-ring rounded-lg bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800">
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
        className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
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
      <select className="focus-ring mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" name={name} defaultValue={defaultValue}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
