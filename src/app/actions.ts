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
