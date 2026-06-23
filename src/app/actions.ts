"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface ServerActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Next.js Server Action to insert or update a unit in the database using the Admin Client.
 * Bypasses RLS securely on the server.
 */
export async function saveUnitAction(
  payload: any,
  isNew: boolean,
  id?: number
): Promise<ServerActionResponse> {
  try {
    if (isNew) {
      const { data, error } = await supabaseAdmin
        .from("units")
        .insert([payload])
        .select();

      if (error) throw error;
      return { success: true, data };
    } else {
      if (id === undefined) {
        throw new Error("Unit ID is required for update operation.");
      }

      const { data, error } = await supabaseAdmin
        .from("units")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) throw error;
      return { success: true, data };
    }
  } catch (err: any) {
    console.error("Error inside saveUnitAction Server Action:", err);
    return { success: false, error: err.message || "Failed to save unit" };
  }
}

/**
 * Next.js Server Action to delete a single unit by its ID.
 * Bypasses RLS securely on the server.
 */
export async function deleteUnitAction(id: number): Promise<ServerActionResponse> {
  try {
    const { error } = await supabaseAdmin
      .from("units")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error inside deleteUnitAction Server Action:", err);
    return { success: false, error: err.message || "Failed to delete unit" };
  }
}

/**
 * Next.js Server Action to perform a bulk delete of multiple units by their IDs.
 * Bypasses RLS securely on the server.
 */
export async function bulkDeleteUnitsAction(ids: number[]): Promise<ServerActionResponse> {
  try {
    const { error } = await supabaseAdmin
      .from("units")
      .delete()
      .in("id", ids);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error inside bulkDeleteUnitsAction Server Action:", err);
    return { success: false, error: err.message || "Failed to bulk delete units" };
  }
}

/**
 * Next.js Server Action to register a Superadmin user in the auth system.
 * Bypasses RLS securely on the server.
 */
export async function registerSuperAdminAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  try {
    // 1. Buat user menggunakan Admin API (melewati verifikasi email standar jika perlu)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Set true jika ingin langsung aktif tanpa perlu klik link email
    });

    if (userError) throw userError;

    // 2. Set role 'superadmin' di app_metadata user
    // app_metadata lebih aman untuk menyimpan role dibandingkan user_metadata
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      { app_metadata: { role: "superadmin" } }
    );

    if (updateError) throw updateError;

    return { success: true, message: "Superadmin berhasil didaftarkan!" };
  } catch (error: any) {
    console.error("Error saat registrasi superadmin:", error);
    return { error: error.message || "Terjadi kesalahan saat registrasi" };
  }
}