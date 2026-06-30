import React from "react";
import { Unit } from "../../domain/entities/types";

interface EditUnitViewProps {
  editingUnitId: string;
  originalUnitRef: React.MutableRefObject<Unit | null>;
  formName: string;
  setFormName: (val: string) => void;
  formShortName: string;
  setFormShortName: (val: string) => void;
  formCategory: Unit["kategori"];
  setFormCategory: (val: Unit["kategori"]) => void;
  formDesc: string;
  setFormDesc: (val: string) => void;
  formBuilding: string;
  setFormBuilding: (val: string) => void;
  formFloor: string;
  setFormFloor: (val: string) => void;
  formAddress: string;
  setFormAddress: (val: string) => void;
  formLat: number;
  setFormLat: (val: number) => void;
  formLng: number;
  setFormLng: (val: number) => void;
  formOpenTime: string;
  setFormOpenTime: (val: string) => void;
  formCloseTime: string;
  setFormCloseTime: (val: string) => void;
  formStatus: Unit["status"];
  setFormStatus: (val: Unit["status"]) => void;
  formContact: string;
  setFormContact: (val: string) => void;
  formWebsite: string;
  setFormWebsite: (val: string) => void;
  changedFields: string[];
  isNewUnit: boolean;
  handleCancelEdit: () => void;
  handleSaveChanges: () => Promise<void>;
  handleDeleteUnit: (id: string) => Promise<void>;
  handleMapClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  pinPlacement: { x: number; y: number };
}

export function EditUnitView({
  editingUnitId,
  originalUnitRef,
  formName,
  setFormName,
  formShortName,
  setFormShortName,
  formCategory,
  setFormCategory,
  formDesc,
  setFormDesc,
  formBuilding,
  setFormBuilding,
  formFloor,
  setFormFloor,
  formAddress,
  setFormAddress,
  formLat,
  setFormLat,
  formLng,
  setFormLng,
  formOpenTime,
  setFormOpenTime,
  formCloseTime,
  setFormCloseTime,
  formStatus,
  setFormStatus,
  formContact,
  setFormContact,
  formWebsite,
  setFormWebsite,
  changedFields,
  isNewUnit,
  handleCancelEdit,
  handleSaveChanges,
  handleDeleteUnit,
  handleMapClick,
  pinPlacement
}: EditUnitViewProps) {
  return (
    <>
      <div className="page-container">
        {/* Header with Autosave status indicator */}
        <div className="view-header">
          <span className="view-pretitle">Edit Unit • ID {editingUnitId} • Terakhir {originalUnitRef.current?.diperbarui}</span>
          <div className="view-title-row">
            <h2 className="view-title">{originalUnitRef.current?.nama}</h2>
            <div className="autosave-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--open)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Tersimpan otomatis • {originalUnitRef.current?.diperbarui}</span>
            </div>
          </div>
          <p className="view-subtitle">Perubahan akan diterapkan setelah disimpan. Field bertanda * wajib diisi.</p>
        </div>

        {/* Two columns forms grid */}
        <div className="edit-columns">
          {/* Left Column Forms */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Identitas Card */}
            <div className="form-card">
              <h3 className="form-card-title">Identitas</h3>
              <div className="form-grid">
                {/* Nama Unit */}
                <div className="form-group form-grid-full">
                  <label className="form-label">
                    <span>Unit Nama <span className="req">*</span></span>
                  </label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                {/* Nama Pendek */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Nama Pendek <span className="req">*</span></span>
                    <span className="hint" style={{ color: "var(--ink-3)" }}>dipakai di callout peta</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formShortName}
                    onChange={(e) => setFormShortName(e.target.value)}
                  />
                </div>

                {/* Kategori Select */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Kategori <span className="req">*</span></span>
                  </label>
                  <select
                    className="form-select-custom"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                  >
                    <option value="Departemen">Departemen</option>
                    <option value="PAA">PAA</option>
                    <option value="Kemahasiswaan">Kemahasiswaan</option>
                    <option value="Vokasi">Vokasi</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Lab">Lab</option>
                  </select>
                </div>

                {/* Deskripsi Singkat */}
                <div className="form-group form-grid-full">
                  <label className="form-label">
                    <span>Deskripsi Singkat</span>
                    <span className="hint" style={{ color: "var(--ink-3)" }}>maks 200 karakter</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={200}
                    className="form-textarea"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Lokasi Card */}
            <div className="form-card">
              <h3 className="form-card-title">Lokasi</h3>
              <div className="form-grid">
                {/* Gedung */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Gedung <span className="req">*</span></span>
                  </label>
                  <select
                    className="form-select-custom"
                    value={formBuilding}
                    onChange={(e) => setFormBuilding(e.target.value)}
                  >
                    <option value="Gedung TI">Gedung TI</option>
                    <option value="Gedung FKM">Gedung FKM</option>
                    <option value="Gedung FK">Gedung FK</option>
                    <option value="Gedung Vokasi">Gedung Vokasi</option>
                  </select>
                </div>

                {/* Lantai */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Lantai <span className="req">*</span></span>
                    <span className="hint" style={{ color: "var(--ink-3)" }}>format: Lt. X</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formFloor}
                    onChange={(e) => setFormFloor(e.target.value)}
                  />
                </div>

                {/* Alamat Lengkap */}
                <div className="form-group form-grid-full">
                  <label className="form-label">
                    <span>Alamat Lengkap</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>

                {/* Latitude */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Latitude <span className="req">*</span></span>
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    className="form-input-text"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                    value={formLat}
                    onChange={(e) => setFormLat(Number(e.target.value))}
                  />
                </div>

                {/* Longitude */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Longitude <span className="req">*</span></span>
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    className="form-input-text"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}
                    value={formLng}
                    onChange={(e) => setFormLng(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Layanan Card */}
            <div className="form-card">
              <h3 className="form-card-title">Layanan</h3>
              <div className="form-grid">
                {/* Jam Operasional */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Jam Buka</span>
                  </label>
                  <div className="time-input-row">
                    <div className="time-box">
                      <input
                        type="text"
                        className="form-input-text"
                        value={formOpenTime}
                        onChange={(e) => setFormOpenTime(e.target.value)}
                      />
                      <span className="time-suffix">WIB</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span>Jam Tutup</span>
                  </label>
                  <div className="time-input-row">
                    <div className="time-box">
                      <input
                        type="text"
                        className="form-input-text"
                        value={formCloseTime}
                        onChange={(e) => setFormCloseTime(e.target.value)}
                      />
                      <span className="time-suffix">WIB</span>
                    </div>
                  </div>
                </div>

                {/* Status saat ini */}
                <div className="form-group form-grid-full">
                  <label className="form-label">
                    <span>Status Saat Ini</span>
                  </label>
                  <div className="segmented-control">
                    <button
                      type="button"
                      className={`segment-btn ${formStatus === "Buka" ? "active open-btn" : ""}`}
                      onClick={() => setFormStatus("Buka")}
                    >
                      <span className="segment-dot"></span>
                      <span>Buka</span>
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${formStatus === "Tutup 30m" ? "active warning-btn" : ""}`}
                      onClick={() => setFormStatus("Tutup 30m")}
                    >
                      <span className="segment-dot"></span>
                      <span>Tutup 30m</span>
                    </button>
                    <button
                      type="button"
                      className={`segment-btn ${formStatus === "Tutup" ? "active closed-btn" : ""}`}
                      onClick={() => setFormStatus("Tutup")}
                    >
                      <span className="segment-dot"></span>
                      <span>Tutup</span>
                    </button>
                  </div>
                </div>

                {/* Nomor Kontak */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Nomor Kontak</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                  />
                </div>

                {/* Situs Website */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Situs Website</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Foto Unit Panel */}
            <div className="form-card">
              <h3 className="form-card-title">Foto unit</h3>
              <div className="photo-upload-placeholder">
                <div className="photo-upload-map-bg"></div>
                <div className="photo-upload-inner">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: "0.5rem" }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <div>FOTO · {formBuilding.toUpperCase()}</div>
                  <div style={{ fontSize: "9px", opacity: 0.8, marginTop: "0.25rem" }}>TERPASANG</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div className="photo-actions-row">
                  <button className="btn btn-secondary" onClick={() => alert("Mengunggah foto baru...")}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Ganti foto</span>
                  </button>
                  <button className="btn-icon-only" style={{ color: "var(--closed)", borderColor: "#fca5a5" }} onClick={() => alert("Foto berhasil dihapus.")} title="Hapus foto">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <span className="photo-hint-text">.jpg / .png · maks 2 MB · rekomendasi 1280x800</span>
              </div>
            </div>

            {/* Pin di peta */}
            <div className="form-card">
              <h3 className="form-card-title">Pin di peta</h3>
              <p style={{ fontSize: "11px", color: "var(--ink-3)", marginTop: "-0.5rem", fontWeight: 500 }}>
                Drag pin atau ketik koordinat di kiri. Klik di peta untuk memosisikan instan.
              </p>

              <div className="map-canvas-container">
                <svg className="map-svg" onClick={handleMapClick}>
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e6e1d3" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="#efece2" />
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  <path d="M 0 50 L 400 50" stroke="#fff" strokeWidth="16" fill="none" />
                  <path d="M 120 0 L 120 220" stroke="#fff" strokeWidth="14" fill="none" />
                  <path d="M 300 0 L 300 220" stroke="#fff" strokeWidth="14" fill="none" />

                  <path d="M 0 50 L 400 50" stroke="#e4decb" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                  <path d="M 120 0 L 120 220" stroke="#e4decb" strokeWidth="1" strokeDasharray="4 4" fill="none" />

                  {/* Buildings */}
                  <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung TI"); setFormLat(-7.27543); setFormLng(112.79742); }}>
                    <rect x="40" y="80" width="60" height="80" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                    <text x="70" y="125" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">GED. TI</text>
                  </g>

                  <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung FKM"); setFormLat(-7.27411); setFormLng(112.79901); }}>
                    <rect x="150" y="20" width="70" height="50" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                    <text x="185" y="48" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">FKM</text>
                  </g>

                  <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung FK"); setFormLat(-7.27685); setFormLng(112.79251); }}>
                    <rect x="150" y="100" width="60" height="50" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                    <text x="180" y="128" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">FK</text>
                  </g>

                  <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormLat(-7.27543); setFormLng(112.79522); }}>
                    <rect x="230" y="100" width="50" height="40" rx="6" fill="#d2cbba" stroke="#b6aa8d" strokeWidth="2" />
                    <text x="255" y="123" fontFamily="var(--font-sans)" fontSize="9" fontWeight="700" fill="var(--ink-3)" textAnchor="middle">PUSAT</text>
                  </g>

                  <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung Vokasi"); setFormLat(-7.27991); setFormLng(112.79422); }}>
                    <rect x="320" y="80" width="60" height="70" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                    <text x="350" y="120" fontFamily="var(--font-sans)" fontSize="9" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">VOKASI</text>
                  </g>

                  {/* Pin overlay */}
                  <g transform={`translate(${pinPlacement.x}, ${pinPlacement.y})`}>
                    <circle cx="0" cy="0" r="10" fill="var(--route)" fillOpacity="0.2" stroke="var(--route)" strokeWidth="1">
                      <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="0" cy="0" r="3" fill="var(--ink)" />
                    <path d="M-9-28c-5 0-9 4-9 9 0 7 9 17 9 17s9-10 9-17c0-5-4-9-9-9z" fill="var(--ink)" />
                    <circle cx="-9" cy="-19" r="3" fill="#fff" />
                  </g>
                </svg>

                <div className="map-control-overlay-badge">
                  LOKASI PIN: {formLat}, {formLng}
                </div>

                <div className="map-control-overlay-action" onClick={() => alert("Silakan klik di area peta mana saja untuk memindahkan pin.")}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                  <span>Klik untuk atur</span>
                </div>

                <div className="map-zoom-controls">
                  <button className="map-zoom-btn" onClick={() => alert("Zoom In")}>+</button>
                  <button className="map-zoom-btn" onClick={() => alert("Zoom Out")}>-</button>
                  <button className="map-zoom-btn" style={{ fontSize: "10px" }} onClick={() => { setFormLat(-7.27543); setFormLng(112.79742); }} title="Reset">⟲</button>
                </div>
              </div>

              <div className="map-info-alert">
                <span className="map-info-alert-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </span>
                <div>
                  <strong>Koordinat = gedung, bukan lantai.</strong> Google Maps tidak bisa diarahkan per-lantai — pastikan field <strong>Lantai</strong> diisi agar pengguna tahu lantai berapa setelah sampai.
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="form-card">
              <h3 className="form-card-title">Metadata</h3>
              <div className="metadata-list">
                <div className="metadata-row">
                  <span className="metadata-label">ID Unit</span>
                  <span className="metadata-value">{editingUnitId}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Dibuat</span>
                  <span className="metadata-value">{originalUnitRef.current?.dibuat}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Diperbarui</span>
                  <span className="metadata-value">{originalUnitRef.current?.diperbarui}</span>
                </div>
                <div className="metadata-row">
                  <span className="metadata-label">Diperbarui Oleh</span>
                  <span className="metadata-value">{originalUnitRef.current?.diperbaruiOleh}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom sticky action bar */}
      <div className="unsaved-bar">
        <div className="unsaved-info">
          <span className="unsaved-dot"></span>
          <span>
            {changedFields.length > 0 ? (
              <>
                {changedFields.length} perubahan belum disimpan ·{" "}
                <span className="unsaved-detail">{changedFields.join(", ")}</span>
              </>
            ) : (
              "Tidak ada perubahan"
            )}
          </span>
        </div>

        <div className="unsaved-actions">
          <button
            className="btn btn-secondary"
            style={{ color: "var(--closed)", borderColor: "transparent", backgroundColor: "transparent" }}
            onClick={() => handleDeleteUnit(editingUnitId)}
          >
            Hapus unit
          </button>
          <button className="btn btn-secondary" onClick={handleCancelEdit}>
            Batal
          </button>
          <button
            className="btn btn-accent"
            style={{ backgroundColor: "var(--route)" }}
            onClick={handleSaveChanges}
            disabled={!isNewUnit && changedFields.length === 0}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Simpan perubahan</span>
          </button>
        </div>
      </div>
    </>
  );
}
