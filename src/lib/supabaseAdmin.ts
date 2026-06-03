import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin can only be used on the server side!");
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xaeudnpyvixevxjuslxt.supabase.co";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey || supabaseServiceRoleKey === "your_supabase_service_role_key_here") {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is missing or using placeholder! Server-side mutations will fail until a valid key is provided in .env.local."
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || "placeholder_key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
