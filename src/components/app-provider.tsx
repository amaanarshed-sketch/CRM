"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { addDaysISO, makeCandidateInput, normalizeDocumentStatus, normalizeStage, todayISO } from "@/lib/candidate-utils";
import { CandidateRow, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { Agency, Candidate, CandidateInput, Profile, StaffMember } from "@/lib/types";

type AuthResult = { ok: true } | { ok: false; message: string };

type AppContextValue = {
  ready: boolean;
  user: Profile | null;
  agency: Agency | null;
  staffMembers: StaffMember[];
  candidates: Candidate[];
  allAgencies: Agency[];
  isDemo: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (payload: { fullName: string; email: string; password: string; agencyName: string }) => Promise<AuthResult>;
  startDemo: () => void;
  logout: () => Promise<void>;
  addCandidate: (input: Partial<CandidateInput>, agencyId?: string) => Promise<Candidate | null>;
  updateCandidate: (id: string, input: Partial<CandidateInput>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  importCandidates: (rows: CandidateInput[]) => Promise<number>;
  updateAgency: (input: Partial<Agency>) => Promise<void>;
  replaceStaff: (names: string[]) => Promise<void>;
};

const DEMO_SESSION_KEY = "leadloop:demo-session";
const DEMO_AGENCY_ID = "demo-workspace";

const emptyAgencyData = {
  agency: null as Agency | null,
  user: null as Profile | null,
  staffMembers: [] as StaffMember[],
  candidates: [] as Candidate[],
  allAgencies: [] as Agency[]
};

const AppContext = createContext<AppContextValue | null>(null);

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function toAgency(row: {
  id: string;
  name: string;
  stale_threshold_days: number;
  default_follow_up_days: number;
  created_at: string;
}): Agency {
  return {
    id: row.id,
    name: row.name,
    staleThresholdDays: row.stale_threshold_days,
    defaultFollowUpDays: row.default_follow_up_days,
    createdAt: row.created_at
  };
}

function toPublicAgency(row: { id: string; name: string; created_at: string }): Agency {
  return {
    id: row.id,
    name: row.name,
    staleThresholdDays: 7,
    defaultFollowUpDays: 2,
    createdAt: row.created_at
  };
}

function toProfile(row: { id: string; agency_id: string; full_name: string; email: string; created_at: string }): Profile {
  return {
    id: row.id,
    agencyId: row.agency_id,
    fullName: row.full_name,
    email: row.email,
    password: "",
    createdAt: row.created_at
  };
}

function toStaff(row: { id: string; agency_id: string; name: string; email: string | null; created_at: string }): StaffMember {
  return {
    id: row.id,
    agencyId: row.agency_id,
    name: row.name,
    email: row.email || undefined,
    createdAt: row.created_at
  };
}

function toCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    agencyId: row.agency_id,
    fullName: row.full_name,
    phone: row.phone || "",
    email: row.email || "",
    source: row.source || "",
    jobInterest: row.job_interest || "",
    location: row.location || "",
    assignedStaff: row.assigned_staff || "",
    stage: normalizeStage(row.stage),
    lastContactedDate: row.last_contacted_date || "",
    nextFollowUpDate: row.next_follow_up_date || "",
    documentStatus: normalizeDocumentStatus(row.document_status),
    notes: row.notes || "",
    experience: row.experience || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toCandidateRow(input: Partial<CandidateInput>, agencyId: string) {
  return {
    agency_id: agencyId,
    full_name: input.fullName || "",
    phone: input.phone || null,
    email: input.email || null,
    source: input.source || null,
    job_interest: input.jobInterest || null,
    location: input.location || null,
    assigned_staff: input.assignedStaff || null,
    stage: input.stage || "New",
    last_contacted_date: input.lastContactedDate || null,
    next_follow_up_date: input.nextFollowUpDate || null,
    document_status: input.documentStatus || "Not requested",
    notes: input.notes || null,
    experience: input.experience || null
  };
}

function toCandidatePatch(input: Partial<CandidateInput>) {
  const patch: Record<string, string | null> = {};
  if ("fullName" in input) patch.full_name = input.fullName || "";
  if ("phone" in input) patch.phone = input.phone || null;
  if ("email" in input) patch.email = input.email || null;
  if ("source" in input) patch.source = input.source || null;
  if ("jobInterest" in input) patch.job_interest = input.jobInterest || null;
  if ("location" in input) patch.location = input.location || null;
  if ("assignedStaff" in input) patch.assigned_staff = input.assignedStaff || null;
  if ("stage" in input) patch.stage = input.stage || "New";
  if ("lastContactedDate" in input) patch.last_contacted_date = input.lastContactedDate || null;
  if ("nextFollowUpDate" in input) patch.next_follow_up_date = input.nextFollowUpDate || null;
  if ("documentStatus" in input) patch.document_status = input.documentStatus || "Not requested";
  if ("notes" in input) patch.notes = input.notes || null;
  if ("experience" in input) patch.experience = input.experience || null;
  return patch;
}

function buildDemoData() {
  const now = new Date().toISOString();
  const agency: Agency = {
    id: DEMO_AGENCY_ID,
    name: "LeadLoop Demo Team",
    staleThresholdDays: 7,
    defaultFollowUpDays: 2,
    createdAt: now
  };
  const user: Profile = {
    id: "demo-user",
    agencyId: agency.id,
    fullName: "Demo Sales Rep",
    email: "demo@leadloop.local",
    password: "",
    createdAt: now
  };
  const staffMembers: StaffMember[] = ["Amaan", "Priya", "Maya"].map((name) => ({
    id: id("staff"),
    agencyId: agency.id,
    name,
    createdAt: now
  }));
  const candidates: Candidate[] = [
    {
      id: id("candidate"),
      agencyId: agency.id,
      fullName: "Sarah Ahmed",
      phone: "+94 77 123 4567",
      email: "sarah@example.com",
      source: "Instagram DM",
      jobInterest: "Salon bridal package inquiry",
      location: "Colombo",
      assignedStaff: "Priya",
      stage: "Follow-up Due",
      lastContactedDate: "2026-04-28",
      nextFollowUpDate: "2026-05-06",
      documentStatus: "Partial",
      notes: "Asked for package options and available dates. Needs pricing details.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: id("candidate"),
      agencyId: agency.id,
      fullName: "Daniel Perera",
      phone: "+94 71 555 0199",
      email: "daniel@example.com",
      source: "Referral",
      jobInterest: "Restaurant private event inquiry",
      location: "Kandy",
      assignedStaff: "Amaan",
      stage: "Appointment Scheduled",
      lastContactedDate: "2026-05-08",
      nextFollowUpDate: "2026-05-09",
      documentStatus: "Complete",
      notes: "Call booked to confirm guest count and menu preference.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: id("candidate"),
      agencyId: agency.id,
      fullName: "Nadeesha Silva",
      phone: "+94 76 888 4422",
      email: "nadeesha@example.com",
      source: "Website",
      jobInterest: "Real estate buyer lead",
      location: "Galle",
      assignedStaff: "Maya",
      stage: "Proposal Sent",
      lastContactedDate: "2026-04-25",
      nextFollowUpDate: "2026-05-03",
      documentStatus: "Complete",
      notes: "Sent apartment options. Waiting for feedback on budget and viewing time.",
      createdAt: now,
      updatedAt: now
    },
    {
      id: id("candidate"),
      agencyId: agency.id,
      fullName: "Rizwan Khan",
      phone: "+94 75 777 2200",
      email: "rizwan@example.com",
      source: "CSV import",
      jobInterest: "B2B agency service lead",
      location: "Negombo",
      assignedStaff: "Priya",
      stage: "Contacted",
      lastContactedDate: "2026-05-02",
      nextFollowUpDate: "2026-05-10",
      documentStatus: "Requested",
      notes: "Interested in monthly marketing support. Asked for a simple proposal.",
      createdAt: now,
      updatedAt: now
    }
  ];

  return { agency, user, staffMembers, candidates, allAgencies: [agency] };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [data, setData] = useState(emptyAgencyData);
  const [isDemo, setIsDemo] = useState(false);

  async function loadPublicAgencies() {
    if (!supabase) return;
    const { data: agencyRows } = await supabase
      .from("intake_agencies")
      .select("id,name,created_at")
      .order("created_at", { ascending: false });
    if (agencyRows) {
      setData((current) => ({ ...current, allAgencies: agencyRows.map(toPublicAgency) }));
    }
  }

  async function loadAgencyData(userId: string) {
    if (!supabase) return;
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("id,agency_id,full_name,email,created_at")
      .eq("id", userId)
      .single();

    if (profileError || !profileRow) {
      setData(emptyAgencyData);
      return;
    }

    const profile = toProfile(profileRow);
    const [agencyResult, staffResult, candidateResult] = await Promise.all([
      supabase
        .from("agencies")
        .select("id,name,stale_threshold_days,default_follow_up_days,created_at")
        .eq("id", profile.agencyId)
        .single(),
      supabase.from("staff_members").select("id,agency_id,name,email,created_at").order("created_at"),
      supabase.from("candidates").select("*").order("updated_at", { ascending: false })
    ]);

    setData({
      user: profile,
      agency: agencyResult.data ? toAgency(agencyResult.data) : null,
      staffMembers: staffResult.data?.map(toStaff) || [],
      candidates: (candidateResult.data as CandidateRow[] | null)?.map(toCandidate) || [],
      allAgencies: agencyResult.data ? [toAgency(agencyResult.data)] : []
    });
  }

  useEffect(() => {
    let active = true;

    async function boot() {
      if (window.localStorage.getItem(DEMO_SESSION_KEY) === "true") {
        setData(buildDemoData());
        setIsDemo(true);
        setReady(true);
        return;
      }

      if (!supabase) {
        setReady(true);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!active) return;
      const sessionUser = sessionData.session?.user || null;
      setAuthUser(sessionUser);
      if (sessionUser) await loadAgencyData(sessionUser.id);
      else await loadPublicAgencies();
      if (active) setReady(true);
    }

    boot();
    if (!supabase) return () => { active = false; };

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      const sessionUser = session?.user || null;
      setAuthUser(sessionUser);
      setIsDemo(false);
      if (sessionUser) await loadAgencyData(sessionUser.id);
      else {
        setData(emptyAgencyData);
        await loadPublicAgencies();
      }
      setReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AppContextValue = useMemo(
    () => ({
      ready,
      user: isDemo ? data.user : authUser ? data.user : null,
      agency: isDemo || authUser ? data.agency : null,
      staffMembers: isDemo || authUser ? data.staffMembers : [],
      candidates: isDemo || authUser ? data.candidates : [],
      allAgencies: data.allAgencies,
      isDemo,
      async login(email, password) {
        if (!supabase) return { ok: false, message: "Supabase is not configured yet. Use the demo workspace or add env variables." };
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) return { ok: false, message: error.message };
        window.localStorage.removeItem(DEMO_SESSION_KEY);
        setIsDemo(false);
        return { ok: true };
      },
      async signup({ fullName, email, password, agencyName }) {
        if (!fullName.trim() || !email.trim() || !password.trim() || !agencyName.trim()) {
          return { ok: false, message: "Fill in every field to create the workspace." };
        }
        if (!supabase) return { ok: false, message: "Supabase is not configured yet. Use the demo workspace or add env variables." };

        const { data: signupData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              agency_name: agencyName.trim()
            }
          }
        });
        if (error) return { ok: false, message: error.message };
        window.localStorage.removeItem(DEMO_SESSION_KEY);
        setIsDemo(false);
        if (signupData.user) await loadAgencyData(signupData.user.id);
        return { ok: true };
      },
      startDemo() {
        window.localStorage.setItem(DEMO_SESSION_KEY, "true");
        setAuthUser(null);
        setData(buildDemoData());
        setIsDemo(true);
        setReady(true);
      },
      async logout() {
        window.localStorage.removeItem(DEMO_SESSION_KEY);
        setIsDemo(false);
        setData(emptyAgencyData);
        if (supabase) await supabase.auth.signOut();
      },
      async addCandidate(input, explicitAgencyId) {
        const targetAgencyId = explicitAgencyId || data.agency?.id;
        if (!targetAgencyId) return null;
        const now = new Date().toISOString();
        const defaults = makeCandidateInput({
          stage: "New",
          nextFollowUpDate: addDaysISO(todayISO(), data.agency?.defaultFollowUpDays || 2),
          ...input
        });

        if (isDemo || !supabase) {
          const candidate: Candidate = {
            ...defaults,
            id: id("candidate"),
            agencyId: targetAgencyId,
            createdAt: now,
            updatedAt: now
          };
          setData((current) => ({ ...current, candidates: [candidate, ...current.candidates] }));
          return candidate;
        }

        const { data: inserted, error } = await supabase
          .from("candidates")
          .insert(toCandidateRow(defaults, targetAgencyId))
          .select("*")
          .single();
        if (error || !inserted) return null;
        const candidate = toCandidate(inserted as CandidateRow);
        setData((current) => ({ ...current, candidates: [candidate, ...current.candidates] }));
        return candidate;
      },
      async updateCandidate(candidateId, input) {
        if (isDemo || !supabase) {
          setData((current) => ({
            ...current,
            candidates: current.candidates.map((candidate) =>
              candidate.id === candidateId ? { ...candidate, ...input, updatedAt: new Date().toISOString() } : candidate
            )
          }));
          return;
        }

        const { data: updated, error } = await supabase
          .from("candidates")
          .update(toCandidatePatch(input))
          .eq("id", candidateId)
          .select("*")
          .single();
        if (error || !updated) return;
        const candidate = toCandidate(updated as CandidateRow);
        setData((current) => ({
          ...current,
          candidates: current.candidates.map((item) => (item.id === candidateId ? candidate : item))
        }));
      },
      async deleteCandidate(candidateId) {
        if (isDemo || !supabase) {
          setData((current) => ({
            ...current,
            candidates: current.candidates.filter((candidate) => candidate.id !== candidateId)
          }));
          return;
        }
        const { error } = await supabase.from("candidates").delete().eq("id", candidateId);
        if (!error) {
          setData((current) => ({
            ...current,
            candidates: current.candidates.filter((candidate) => candidate.id !== candidateId)
          }));
        }
      },
      async importCandidates(rows) {
        const targetAgencyId = data.agency?.id;
        if (!targetAgencyId) return 0;
        if (isDemo || !supabase) {
          const now = new Date().toISOString();
          const imported = rows.map<Candidate>((row) => ({
            ...row,
            id: id("candidate"),
            agencyId: targetAgencyId,
            createdAt: now,
            updatedAt: now
          }));
          setData((current) => ({ ...current, candidates: [...imported, ...current.candidates] }));
          return imported.length;
        }

        const { data: inserted, error } = await supabase
          .from("candidates")
          .insert(rows.map((row) => toCandidateRow(row, targetAgencyId)))
          .select("*");
        if (error || !inserted) return 0;
        const imported = (inserted as CandidateRow[]).map(toCandidate);
        setData((current) => ({ ...current, candidates: [...imported, ...current.candidates] }));
        return imported.length;
      },
      async updateAgency(input) {
        if (!data.agency) return;
        const nextAgency = { ...data.agency, ...input };
        if (isDemo || !supabase) {
          setData((current) => ({ ...current, agency: nextAgency, allAgencies: [nextAgency] }));
          return;
        }
        const { data: updated, error } = await supabase
          .from("agencies")
          .update({
            name: nextAgency.name,
            stale_threshold_days: nextAgency.staleThresholdDays,
            default_follow_up_days: nextAgency.defaultFollowUpDays
          })
          .eq("id", data.agency.id)
          .select("id,name,stale_threshold_days,default_follow_up_days,created_at")
          .single();
        if (!error && updated) {
          const agency = toAgency(updated);
          setData((current) => ({ ...current, agency, allAgencies: [agency] }));
        }
      },
      async replaceStaff(names) {
        if (!data.agency) return;
        const cleanNames = names.map((name) => name.trim()).filter(Boolean);
        const now = new Date().toISOString();

        if (isDemo || !supabase) {
          const staffMembers = cleanNames.map<StaffMember>((name) => ({
            id: id("staff"),
            agencyId: data.agency!.id,
            name,
            createdAt: now
          }));
          setData((current) => ({ ...current, staffMembers }));
          return;
        }

        await supabase.from("staff_members").delete().eq("agency_id", data.agency.id);
        const { data: inserted } = await supabase
          .from("staff_members")
          .insert(cleanNames.map((name) => ({ agency_id: data.agency!.id, name })))
          .select("id,agency_id,name,email,created_at");
        setData((current) => ({ ...current, staffMembers: inserted?.map(toStaff) || [] }));
      }
    }),
    [authUser, data, isDemo, ready]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
