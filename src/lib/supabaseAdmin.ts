import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin can only be used on the server side!");
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xaeudnpyvixevxjuslxt.supabase.co";
let supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isPlaceholderOrMissing =
  !supabaseServiceRoleKey ||
  supabaseServiceRoleKey === "your_supabase_service_role_key_here" ||
  supabaseServiceRoleKey.trim() === "";

if (isPlaceholderOrMissing) {
  // Gunakan anon key sebagai fallback aman agar server actions tidak gagal total dengan error 'Invalid API key'
  supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.warn(
    "Warning: SUPABASE_SERVICE_ROLE_KEY tidak ditemukan atau masih menggunakan placeholder! Menggunakan NEXT_PUBLIC_SUPABASE_ANON_KEY sebagai fallback. Aksi penulisan/mutasi database mungkin gagal jika RLS (Row Level Security) aktif di Supabase Anda."
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
