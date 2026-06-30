import { UnitRepository } from "../../domain/repositories/unit.repository";
import { Unit, Category, Building } from "../../domain/entities/types";
import { supabase } from "@/lib/supabaseClient";
import { saveUnitAction, deleteUnitAction, bulkDeleteUnitsAction } from "@/app/actions";
import { mapDbToUnit } from "../mappers/unit.mapper";

export class UnitRepositoryImpl implements UnitRepository {
  async getUnits(): Promise<Unit[]> {
    const { data, error } = await supabase
      .from("units")
      .select("*, categories(id, name), buildings(id, name)")
      .order("id", { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbToUnit);
  }

  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getBuildings(): Promise<Building[]> {
    const { data, error } = await supabase
      .from("buildings")
      .select("id, name, lat, lng")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async saveUnit(payload: any, isNew: boolean, id?: number) {
    return await saveUnitAction(payload, isNew, id);
  }

  async deleteUnit(id: number) {
    return await deleteUnitAction(id);
  }

  async bulkDeleteUnits(ids: number[]) {
    return await bulkDeleteUnitsAction(ids);
  }
}

// Single instance to use as singleton if needed, or instantiate as required.
export const unitRepositoryInstance = new UnitRepositoryImpl();
