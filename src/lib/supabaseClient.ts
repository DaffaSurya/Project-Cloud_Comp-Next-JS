import { createClient } from "@supabase/supabase-js";

// Safe fallbacks to prevent Next.js static build / server-side evaluation from crashing
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xaeudnpyvixevxjuslxt.supabase.co/rest/v1/";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_de5hAR2uJwkfeBQt2pX-jQ_B95Ym7hv";

if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "Supabase environment variables are missing! Using secure fallbacks to allow Next.js static build evaluation."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
