import React from "react";
import { Unit, ActivityLog } from "../../domain/entities/types";

interface DashboardViewProps {
  units: Unit[];
  totalUnitsCount: number;
  totalBuildingsCount: number;
  totalCategoriesCount: number;
  categoryCounts: Record<string, number>;
  maxCategoryCount: number;
  activityLogs: ActivityLog[];
  totalCoordinatesValid: number;
  setActiveTab: (tab: "dashboard" | "units" | "edit") => void;
  handleEditUnit: (unit: Unit) => void;
}

export function DashboardView({
  units,
  totalUnitsCount,
  totalBuildingsCount,
  totalCategoriesCount,
  categoryCounts,
  maxCategoryCount,
  activityLogs,
  totalCoordinatesValid,
  setActiveTab,
  handleEditUnit
}: DashboardViewProps) {
  return (
    <div className="page-container">
      <div className="view-header">
        <span className="view-pretitle">Overview • 17 Mei 2026</span>
        <div className="view-title-row">
          <h2 className="view-title">Dashboard</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-secondary" onClick={() => alert("Data CSV berhasil diekspor.")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Ekspor CSV</span>
            </button>
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
        </div>
        <p className="view-subtitle">Status data direktori unit kampus dan aktivitas hari ini.</p>
      </div>

      {/* Metrics cards */}
      <div className="metrics-grid">
        {/* Card 1: Total Units */}
        <div className="metric-card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("units")}>
          <div className="metric-header">
            <span className="metric-icon-wrap" style={{ backgroundColor: "var(--route-tint)", color: "var(--route)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span className="metric-badge success">↑ +2 minggu ini</span>
          </div>
          <span className="metric-label">Total Units</span>
          <div className="metric-value-row">
            <span className="metric-value">{totalUnitsCount}</span>
            <span className="metric-unit">unit</span>
          </div>
        </div>

        {/* Card 2: Buildings */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
              </svg>
            </span>
            <span className="metric-badge neutral">Gedung</span>
          </div>
          <span className="metric-label">Gedung</span>
          <div className="metric-value-row">
            <span className="metric-value">{totalBuildingsCount}</span>
            <span className="metric-unit">gedung</span>
          </div>
        </div>

        {/* Card 3: Categories */}
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </span>
            <span className="metric-badge neutral">Kategori</span>
          </div>
          <span className="metric-label">Kategori</span>
          <div className="metric-value-row">
            <span className="metric-value">{totalCategoriesCount}</span>
            <span className="metric-unit">kategori</span>
          </div>
        </div>

        {/* Card 4: API Calls */}
        <div className="metric-card" style={{ borderLeft: "3px solid var(--route)" }}>
          <div className="metric-header">
            <span className="metric-icon-wrap" style={{ backgroundColor: "var(--route-tint)", color: "var(--route)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </span>
            <span className="metric-badge success">↑ +12.4%</span>
          </div>
          <span className="metric-label">API Calls 24J</span>
          <div className="metric-value-row">
            <span className="metric-value">2,148</span>
          </div>
        </div>

        {/* Card 5: Error Rate */}
        <div className="metric-card" style={{ borderLeft: "3px solid var(--closed)" }}>
          <div className="metric-header">
            <span className="metric-icon-wrap" style={{ backgroundColor: "#fee2e2", color: "var(--closed)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <span className="metric-badge error">↓ -0.2%</span>
          </div>
          <span className="metric-label">Error Rate</span>
          <div className="metric-value-row">
            <span className="metric-value">0.4</span>
            <span className="metric-unit">%</span>
          </div>
        </div>
      </div>

      {/* Columns section */}
      <div className="dashboard-columns">
        {/* Left Column: Category Progress Chart */}
        <div className="content-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <span className="card-tag">Distribusi</span>
              <h3 className="card-title">Unit per kategori</h3>
            </div>
            <span className="card-subtitle-info">9 unit • 6 kategori</span>
          </div>

          <div className="category-progress-list">
            {(["Departemen", "PAA", "Kemahasiswaan", "Vokasi", "Kesehatan", "Lab"] as const).map((cat) => {
              const count = categoryCounts[cat] || 0;
              const percent = Math.round((count / Math.max(1, totalUnitsCount)) * 100);
              const relativeBarFill = Math.round((count / maxCategoryCount) * 100);

              const iconLetters: Record<string, string> = {
                Departemen: "D",
                PAA: "P",
                Kemahasiswaan: "K",
                Vokasi: "V",
                Kesehatan: "H",
                Lab: "L"
              };

              return (
                <div className="progress-item" key={cat}>
                  <div className="progress-icon-wrap" style={{ fontWeight: 700, fontSize: 11, fontFamily: "var(--font-mono)" }}>
                    {iconLetters[cat]}
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-label-row">
                      <span>{cat}</span>
                      <div className="progress-stats-mono">
                        <span className="progress-count">{String(count).padStart(2, "0")}</span>
                        <span className="progress-percent">· {percent}%</span>
                      </div>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${relativeBarFill}%`,
                          backgroundColor: cat === "Departemen" ? "var(--ink)" : "var(--ink-2)"
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recent Activity History */}
        <div className="content-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <span className="card-tag">Aktivitas</span>
              <h3 className="card-title">Perubahan terbaru</h3>
            </div>
            <span className="card-link" onClick={() => alert("Membuka log riwayat perubahan sistem lengkap...")}>Lihat semua</span>
          </div>

          <div className="activity-timeline">
            {activityLogs.map((log) => (
              <div className="activity-row" key={log.id}>
                <div className="activity-avatar">{log.initials}</div>
                <div className="activity-details">
                  <div className="activity-desc">
                    <span className="activity-bold">{log.user} </span>
                    {log.action} <span className="activity-bold">{log.target}</span>
                  </div>
                  <div className="activity-time-row">
                    <span>{log.time}</span>
                    <span>·</span>
                    <span>{log.relativeTime}</span>
                  </div>
                </div>
                <span className="activity-chevron">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row grid */}
      <div className="dashboard-bottom-grid">
        {/* Endpoint Status List */}
        <div className="content-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <span className="card-tag">Endpoint</span>
              <h3 className="card-title">API calls · 24 jam</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--route)", fontSize: "11px", fontWeight: "700" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--route)" }}></span>
              <span>Semua online</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Path</th>
                  <th style={{ textAlign: "right" }}>P95</th>
                  <th style={{ textAlign: "right" }}>Hits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bold success" style={{ color: "var(--open)" }}>GET</td>
                  <td className="mono">/api/mcp/sse</td>
                  <td className="mono" style={{ textAlign: "right" }}>142 ms</td>
                  <td className="mono" style={{ textAlign: "right" }}>892</td>
                </tr>
                <tr>
                  <td className="bold success" style={{ color: "var(--open)" }}>POST</td>
                  <td className="mono">/api/mcp/sse/post-url</td>
                  <td className="mono" style={{ textAlign: "right" }}>98 ms</td>
                  <td className="mono" style={{ textAlign: "right" }}>1,214</td>
                </tr>
                <tr>
                  <td className="bold success" style={{ color: "var(--open)" }}>GET</td>
                  <td className="mono">/api/units/0001</td>
                  <td className="mono" style={{ textAlign: "right" }}>38 ms</td>
                  <td className="mono" style={{ textAlign: "right" }}>42</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Data completeness check card */}
        <div className="validation-card">
          <div className="card-header-row" style={{ borderBottom: "none", marginBottom: 0, paddingBottom: 0 }}>
            <div className="card-title-group">
              <span className="card-tag">Validasi</span>
              <h3 className="card-title">Kelengkapan data</h3>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="validation-row">
              <div className="validation-left">
                <span className="validation-circle-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="validation-text">Koordinat (lat/lng) valid</span>
              </div>
              <span className="validation-ratio-mono">
                {totalCoordinatesValid}/{totalUnitsCount}
              </span>
            </div>

            <div className="validation-row">
              <div className="validation-left">
                <span className="validation-circle-check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="validation-text">Jadwal layanan terisi</span>
              </div>
              <span className="validation-ratio-mono">{totalUnitsCount}/{totalUnitsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
