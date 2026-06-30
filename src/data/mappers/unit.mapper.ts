import { Unit } from "../../domain/entities/types";

export function mapDbToUnit(u: any): Unit {
  return {
    id: String(u.id),
    nama: u.name || "",
    namaPendek: u.short_name || "",
    kategori: (u.categories?.name || "Departemen") as Unit["kategori"],
    gedung: u.buildings?.name || "Gedung TI",
    lantai: u.floor || "",
    alamat: u.address || "",
    latitude: Number(u.lat) || 0,
    longitude: Number(u.lng) || 0,
    jamBuka: u.open_hours ? u.open_hours.substring(0, 5) : "08:00",
    jamTutup: u.close_hours ? u.close_hours.substring(0, 5) : "16:00",
    status: (u.is_published ? "Buka" : "Tutup") as Unit["status"],
    nomorKontak: "",
    situs: "",
    diperbarui: u.updated_at
      ? new Date(u.updated_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : "Baru",
    diperbaruiOleh: "Sistem • sync",
    dibuat: u.created_at
      ? new Date(u.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
      : "Baru",
    deskripsi: u.description || ""
  };
}
