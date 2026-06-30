import { Unit, Category, Building } from "../entities/types";

export interface UnitRepository {
  getUnits(): Promise<Unit[]>;
  getCategories(): Promise<Category[]>;
  getBuildings(): Promise<Building[]>;
  saveUnit(payload: any, isNew: boolean, id?: number): Promise<{ success: boolean; data?: any; error?: string }>;
  deleteUnit(id: number): Promise<{ success: boolean; error?: string }>;
  bulkDeleteUnits(ids: number[]): Promise<{ success: boolean; error?: string }>;
}
