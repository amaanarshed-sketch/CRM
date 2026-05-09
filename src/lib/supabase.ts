import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

export type CandidateRow = {
  id: string;
  agency_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  job_interest: string | null;
  location: string | null;
  assigned_staff: string | null;
  stage: string;
  last_contacted_date: string | null;
  next_follow_up_date: string | null;
  document_status: string;
  notes: string | null;
  experience: string | null;
  created_at: string;
  updated_at: string;
};
