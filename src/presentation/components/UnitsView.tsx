import React from "react";
import { Unit } from "../../domain/entities/types";

interface UnitsViewProps {
  units: Unit[];
  totalUnitsCount: number;
  categoryCounts: Record<string, number>;
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  buildingFilter: string;
  setBuildingFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  selectedUnitIds: string[];
  setSelectedUnitIds: React.Dispatch<React.SetStateAction<string[]>>;
  perPage: number;
  setPerPage: (val: number) => void;
  currentPage: number;
  setCurrentPage: (val: number) => void;
  filteredUnits: Unit[];
  handleBulkChangeBuilding: (newBuilding: string) => void;
  handleBulkDelete: () => Promise<void>;
  handleToggleSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToggleSelectUnit: (id: string) => void;
  handleEditUnit: (unit: Unit) => void;
  handleDeleteUnit: (id: string) => Promise<void>;
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
}

export function UnitsView({
  units,
  totalUnitsCount,
  categoryCounts,
  searchFilter,
  setSearchFilter,
  categoryFilter,
  setCategoryFilter,
  buildingFilter,
  setBuildingFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  selectedUnitIds,
  setSelectedUnitIds,
  perPage,
  setPerPage,
  currentPage,
  setCurrentPage,
  filteredUnits,
  handleBulkChangeBuilding,
  handleBulkDelete,
  handleToggleSelectAll,
  handleToggleSelectUnit,
  handleEditUnit,
  handleDeleteUnit,
  setUnits
}: UnitsViewProps) {
  return (
    <div className="page-container">
      {/* View Header */}
      <div className="view-header">
        <span className="view-pretitle">Manage • 9 Unit Terdaftar</span>
        <div className="view-title-row">
          <h2 className="view-title">Units</h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              const nextId = String(Number(units[units.length - 1]?.id || "0") + 1).padStart(4, "0");
              handleEditUnit({
                id: nextId,
                nama: "Unit Baru Kampus",
                namaPendek: "Unit Baru",
                kategori: "Departemen",
                gedung: "Gedung TI",
                lantai: "Lt. 1",
                alamat: "Jl. Raya Kampus",
                latitude: -7.27543,
                longitude: 112.79742,
                jamBuka: "08:00",
                jamTutup: "16:00",
                status: "Buka",
                nomorKontak: "+62 31 594 0000",
                situs: "baru.kampus.ac.id",
                diperbarui: "Baru",
                diperbaruiOleh: "Rizky • r.admin",
                dibuat: "17 Mei 2026",
                deskripsi: "Deskripsi singkat unit kampus yang baru ditambahkan."
              });
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Unit</span>
          </button>
        </div>
        <p className="view-subtitle">Kelola direktori unit kampus — departemen, PAA, kemahasiswaan, vokasi, kesehatan, dan lab.</p>
      </div>

      {/* Table filter settings bar */}
      <div className="filter-bar">
        {/* Dropdowns */}
        <div className="filter-inputs-row">
          <div className="filter-search-container">
            <svg className="search-icon-left" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama unit, gedung, atau short..."
              className="filter-search-input"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>

          <div className="form-group">
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="Semua">Kategori: Semua</option>
              <option value="Departemen">Departemen</option>
              <option value="PAA">PAA</option>
              <option value="Kemahasiswaan">Kemahasiswaan</option>
              <option value="Vokasi">Vokasi</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Lab">Lab</option>
            </select>
          </div>

          <div className="form-group">
            <select
              className="filter-select"
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="Semua">Gedung: Semua</option>
              <option value="Gedung TI">Gedung TI</option>
              <option value="Gedung FKM">Gedung FKM</option>
              <option value="Gedung FK">Gedung FK</option>
              <option value="Gedung Vokasi">Gedung Vokasi</option>
            </select>
          </div>

          <div className="form-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Semua">Status: Semua</option>
              <option value="Buka">Buka</option>
              <option value="Tutup 30m">Tutup 30m</option>
              <option value="Tutup">Tutup</option>
            </select>
          </div>

          <div className="form-group">
            <select
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Diperbarui">Urut: Diperbarui ↓</option>
              <option value="Nama (A-Z)">Urut: Nama (A-Z)</option>
              <option value="ID">Urut: ID Unit</option>
            </select>
          </div>
        </div>

        {/* Sub-category chips row */}
        <div className="category-chips-row">
          <button
            className={`chip-btn ${categoryFilter === "Semua" ? "active" : ""}`}
            onClick={() => setCategoryFilter("Semua")}
          >
            <span>Semua</span>
            <span className="chip-count">{totalUnitsCount}</span>
          </button>
          {(["Departemen", "PAA", "Kemahasiswaan", "Vokasi", "Kesehatan", "Lab"] as const).map((cat) => {
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                className={`chip-btn ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                <span>{cat}</span>
                <span className="chip-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Bulk Action bar */}
      {selectedUnitIds.length > 0 && (
        <div className="bulk-actions-panel">
          <div className="bulk-info-row">
            <button className="bulk-close-btn" onClick={() => setSelectedUnitIds([])} title="Batal pilihan">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <span className="bulk-selection-indicator">{selectedUnitIds.length} dipilih</span>
            <span>Aksi massal untuk baris terpilih:</span>
          </div>

          <div className="bulk-actions-group">
            <select
              className="filter-select"
              style={{ width: "auto", padding: "0.3rem 0.5rem", height: "30px", fontSize: "11px", backgroundColor: "var(--ink-2)", color: "#fff", borderColor: "transparent" }}
              onChange={(e) => {
                if (e.target.value !== "") {
                  handleBulkChangeBuilding(e.target.value);
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Ubah gedung...</option>
              <option value="Gedung TI">Gedung TI</option>
              <option value="Gedung FKM">Gedung FKM</option>
              <option value="Gedung FK">Gedung FK</option>
              <option value="Gedung Vokasi">Gedung Vokasi</option>
            </select>

            <button className="bulk-action-btn" onClick={() => {
              const newCat = prompt("Masukkan nama kategori tujuan (Departemen, PAA, Kemahasiswaan, Vokasi, Kesehatan, Lab):");
              if (newCat && ["Departemen", "PAA", "Kemahasiswaan", "Vokasi", "Kesehatan", "Lab"].includes(newCat)) {
                setUnits(prev => prev.map(u => selectedUnitIds.includes(u.id) ? { ...u, kategori: newCat as any } : u));
                setSelectedUnitIds([]);
                alert("Kategori unit terpilih berhasil diubah.");
              }
            }}>
              Ubah kategori
            </button>

            <button className="bulk-action-btn" onClick={() => {
              alert(`Ekspor ${selectedUnitIds.length} data unit terkompresi.`);
              setSelectedUnitIds([]);
            }}>
              Ekspor
            </button>

            <button className="bulk-action-btn danger-action" onClick={handleBulkDelete}>
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Master Data Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="custom-checkbox-td">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={filteredUnits.length > 0 && selectedUnitIds.length === filteredUnits.length}
                  onChange={handleToggleSelectAll}
                />
              </th>
              <th style={{ width: "30%" }}>Unit</th>
              <th>Kategori</th>
              <th>Gedung - Lt.</th>
              <th>Koordinat</th>
              <th>Jam Layanan</th>
              <th>Status</th>
              <th>Diperbarui</th>
              <th style={{ width: "80px", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.length > 0 ? (
              filteredUnits.slice(0, perPage).map((unit) => {
                const isSelected = selectedUnitIds.includes(unit.id);
                return (
                  <tr key={unit.id} style={{ backgroundColor: isSelected ? "var(--paper-2)" : undefined }}>
                    <td className="custom-checkbox-td">
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectUnit(unit.id)}
                      />
                    </td>
                    <td>
                      <div className="table-unit-col">
                        <div className="table-unit-icon-wrap">
                          <span style={{ fontWeight: 700, fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                            {unit.kategori[0]}
                          </span>
                        </div>
                        <div className="table-unit-info">
                          <span className="table-unit-name">{unit.nama}</span>
                          <div className="table-unit-meta">
                            <span>id: {unit.id}</span>
                            <span>·</span>
                            <span>{unit.namaPendek}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="kategori-tag">
                        <svg className="kategori-tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        <span>{unit.kategori}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{unit.gedung}</span> ·{" "}
                      <span style={{ color: "var(--ink-2)", fontWeight: 500 }}>{unit.lantai}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: "500" }}>
                        {unit.latitude}, {unit.longitude}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{unit.jamBuka} - {unit.jamTutup}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          unit.status === "Buka"
                            ? "open"
                            : unit.status === "Tutup 30m"
                            ? "warning"
                            : "closed"
                        }`}
                      >
                        <span className="status-badge-dot"></span>
                        <span>{unit.status}</span>
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: "var(--ink-2)" }}>{unit.diperbarui}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.25rem" }}>
                        <button
                          className="btn-icon-only"
                          style={{ padding: "0.35rem" }}
                          title="Edit Unit"
                          onClick={() => handleEditUnit(unit)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn-icon-only"
                          style={{ padding: "0.35rem" }}
                          title="Menu Aksi"
                          onClick={() => {
                            const op = prompt("Masukkan aksi (hapus, detail):");
                            if (op === "hapus") {
                              handleDeleteUnit(unit.id);
                            } else if (op === "detail") {
                              alert(`ID: ${unit.id}\nNama: ${unit.nama}\nKoordinat: ${unit.latitude}, ${unit.longitude}`);
                            }
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "var(--ink-3)" }}>
                  Tidak ada unit yang sesuai dengan kriteria filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Functional Pagination Row */}
        <div className="pagination-row">
          <div className="pagination-left">
            Showing 1-{Math.min(perPage, filteredUnits.length)} of {filteredUnits.length} units
          </div>

          <div className="pagination-right">
            <div className="pagination-perpage">
              <span>per halaman</span>
              <select
                className="pagination-select"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="pagination-pages">
              <button className="pagination-btn" disabled>&lt;</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn" onClick={() => alert("Simulasi halaman ke-2")}>2</button>
              <button className="pagination-btn" onClick={() => alert("Simulasi halaman ke-3")}>3</button>
              <button className="pagination-btn" onClick={() => alert("Simulasi halaman berikutnya")}>&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
