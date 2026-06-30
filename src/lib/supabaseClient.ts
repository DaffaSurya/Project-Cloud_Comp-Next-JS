// import { createClient } from "@supabase/supabase-js";

// // Safe fallbacks to prevent Next.js static build / server-side evaluation from crashing
// const supabaseUrl =
//   process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xaeudnpyvixevxjuslxt.supabase.co";
// const supabaseAnonKey =
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
//   "sb_publishable_de5hAR2uJwkfeBQt2pX-jQ_B95Ym7hv";

// if (
//   !process.env.NEXT_PUBLIC_SUPABASE_URL ||
//   !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// ) {
//   console.warn(
//     "Supabase environment variables are missing! Using secure fallbacks to allow Next.js static build evaluation."
//   );
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Peringatan jika .env belum terbaca
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing! Pastikan file .env.local sudah ada dan server sudah di-restart.");
}

// INI BAGIAN YANG PALING PENTING (Membuat dan mengekspor client)
export const supabase = createClient(
  supabaseUrl || "https://xaeudnpyvixevxjuslxt.supabase.co", // Fallback URL
  supabaseAnonKey || "sb_publishable_de5hAR2uJwkfeBQt2pX-jQ_B95Ym7hv" // Fallback Key
);