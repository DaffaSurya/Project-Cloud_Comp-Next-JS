export interface Unit {
  id: string;
  nama: string;
  namaPendek: string;
  kategori: "Departemen" | "PAA" | "Kemahasiswaan" | "Vokasi" | "Kesehatan" | "Lab";
  gedung: string;
  lantai: string;
  alamat: string;
  latitude: number;
  longitude: number;
  jamBuka: string;
  jamTutup: string;
  status: "Buka" | "Tutup 30m" | "Tutup";
  nomorKontak: string;
  situs: string;
  diperbarui: string;
  diperbaruiOleh: string;
  dibuat: string;
  deskripsi: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  relativeTime: string;
  initials: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Building {
  id: number;
  name: string;
  lat: number;
  lng: number;
}
