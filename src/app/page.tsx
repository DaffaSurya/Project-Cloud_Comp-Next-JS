"use client";

import { useState } from "react";
import { useAuth } from "@/presentation/hooks/useAuth";
import { useMcpSse } from "@/presentation/hooks/useMcpSse";
import { useUnitsData } from "@/presentation/hooks/useUnitsData";
import { useUnitForm } from "@/presentation/hooks/useUnitForm";

import { LoadingScreen } from "@/presentation/components/LoadingScreen";
import { Sidebar } from "@/presentation/components/Sidebar";
import { DashboardView } from "@/presentation/components/DashboardView";
import { UnitsView } from "@/presentation/components/UnitsView";
import { EditUnitView } from "@/presentation/components/EditUnitView";

export default function Home() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "units" | "edit">("dashboard");

  // Domain & Data Hooks
  const { authLoading, userEmail, userName, userInitials, handleLogout } = useAuth();
  const { connectionStatus, postUrl } = useMcpSse();

  const {
    isLoading,
    setIsLoading,
    errorMessage,
    setErrorMessage,
    categoriesList,
    buildingsList,
    units,
    setUnits,
    activityLogs,
    setActivityLogs,
    sidebarSearch,
    setSidebarSearch,
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
    fetchUnits,
    handleBulkDelete,
    handleBulkChangeBuilding,
    handleToggleSelectAll,
    handleToggleSelectUnit,
    totalUnitsCount,
    totalBuildingsCount,
    totalCategoriesCount,
    categoryCounts,
    maxCategoryCount,
    filteredUnits,
    totalCoordinatesValid
  } = useUnitsData();

  const {
    editingUnitId,
    setEditingUnitId,
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
    originalUnitRef,
    handleEditUnit,
    changedFields,
    isNewUnit,
    handleCancelEdit,
    handleSaveChanges,
    handleDeleteUnit,
    handleMapClick,
    pinPlacement
  } = useUnitForm({
    units,
    categoriesList,
    buildingsList,
    fetchUnits,
    setActivityLogs,
    setActiveTab,
    setIsLoading,
    setErrorMessage,
    setSelectedUnitIds
  });

  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-layout">
      {/* 1. Left Sidebar */}
      <Sidebar
        sidebarSearch={sidebarSearch}
        setSidebarSearch={setSidebarSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalUnitsCount={totalUnitsCount}
        totalBuildingsCount={totalBuildingsCount}
        connectionStatus={connectionStatus}
        postUrl={postUrl}
        userInitials={userInitials}
        userName={userName}
        userEmail={userEmail}
        handleLogout={handleLogout}
      />

      {/* 2. Main Area */}
      <main className="main-content">
        {/* Sync loading spinner banner */}
        {isLoading && (
          <div style={{
            padding: "0.85rem 1.5rem",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            color: "var(--ink)",
            fontSize: "13px",
            fontWeight: "600"
          }}>
            <svg style={{ animation: "spin 1s linear infinite", width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.2 }}></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.8 }}></path>
            </svg>
            <span>Menyinkronkan data real-time dengan Supabase...</span>
          </div>
        )}

        {/* Sync error prompt banner */}
        {errorMessage && (
          <div style={{
            padding: "0.85rem 1.5rem",
            backgroundColor: "rgba(239, 68, 68, 0.06)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(239, 68, 68, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            color: "var(--closed)",
            fontSize: "13px",
            fontWeight: "600"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--closed)",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="top-bar">
          <div className="breadcrumb">
            <span>Admin</span>
            <span className="breadcrumb-separator">/</span>
            {activeTab === "dashboard" && <span className="breadcrumb-active">Dashboard</span>}
            {(activeTab === "units" || activeTab === "edit") && (
              <>
                <span
                  style={{ cursor: "pointer" }}
                  className={activeTab === "units" ? "breadcrumb-active" : ""}
                  onClick={() => {
                    setActiveTab("units");
                    setEditingUnitId(null);
                  }}
                >
                  Units
                </span>
                {activeTab === "edit" && (
                  <>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-active">Edit - {formShortName || "Unit"}</span>
                  </>
                )}
              </>
            )}
          </div>

          <div className="top-bar-actions">
            {/* Real-time date display */}
            <div className="datetime-selector">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>17 Mei 2026 • 09:42</span>
            </div>

            {/* Notification Badge */}
            <button className="btn-icon-only" style={{ borderRadius: "50%", padding: "0.45rem" }} title="Notifikasi">
              <div style={{ position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <div style={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--closed)" }}></div>
              </div>
            </button>

            {/* Add unit CTA */}
            <button
              className="btn btn-primary"
              onClick={() => {
                const nextId = String(Number(units[units.length - 1]?.id || "0") + 1).padStart(4, "0");
                const newUnit = {
                  id: nextId,
                  nama: "Unit Baru Kampus",
                  namaPendek: "Unit Baru",
                  kategori: "Departemen" as const,
                  gedung: "Gedung TI",
                  lantai: "Lt. 1",
                  alamat: "Jl. Raya Kampus",
                  latitude: -7.27543,
                  longitude: 112.79742,
                  jamBuka: "08:00",
                  jamTutup: "16:00",
                  status: "Buka" as const,
                  nomorKontak: "+62 31 594 0000",
                  situs: "baru.kampus.ac.id",
                  diperbarui: "Baru",
                  diperbaruiOleh: "Rizky • r.admin",
                  dibuat: "17 Mei 2026",
                  deskripsi: "Deskripsi singkat unit kampus yang baru ditambahkan."
                };
                handleEditUnit(newUnit);
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

        {/* Views Router Composition */}
        {activeTab === "dashboard" && (
          <DashboardView
            units={units}
            totalUnitsCount={totalUnitsCount}
            totalBuildingsCount={totalBuildingsCount}
            totalCategoriesCount={totalCategoriesCount}
            categoryCounts={categoryCounts}
            maxCategoryCount={maxCategoryCount}
            activityLogs={activityLogs}
            totalCoordinatesValid={totalCoordinatesValid}
            setActiveTab={setActiveTab}
            handleEditUnit={handleEditUnit}
          />
        )}

        {activeTab === "units" && (
          <UnitsView
            units={units}
            totalUnitsCount={totalUnitsCount}
            categoryCounts={categoryCounts}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            buildingFilter={buildingFilter}
            setBuildingFilter={setBuildingFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            selectedUnitIds={selectedUnitIds}
            setSelectedUnitIds={setSelectedUnitIds}
            perPage={perPage}
            setPerPage={setPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            filteredUnits={filteredUnits}
            handleBulkChangeBuilding={handleBulkChangeBuilding}
            handleBulkDelete={handleBulkDelete}
            handleToggleSelectAll={handleToggleSelectAll}
            handleToggleSelectUnit={handleToggleSelectUnit}
            handleEditUnit={handleEditUnit}
            handleDeleteUnit={handleDeleteUnit}
            setUnits={setUnits}
          />
        )}

        {activeTab === "edit" && editingUnitId && (
          <EditUnitView
            editingUnitId={editingUnitId}
            originalUnitRef={originalUnitRef}
            formName={formName}
            setFormName={setFormName}
            formShortName={formShortName}
            setFormShortName={setFormShortName}
            formCategory={formCategory}
            setFormCategory={setFormCategory}
            formDesc={formDesc}
            setFormDesc={setFormDesc}
            formBuilding={formBuilding}
            setFormBuilding={setFormBuilding}
            formFloor={formFloor}
            setFormFloor={setFormFloor}
            formAddress={formAddress}
            setFormAddress={setFormAddress}
            formLat={formLat}
            setFormLat={setFormLat}
            formLng={formLng}
            setFormLng={setFormLng}
            formOpenTime={formOpenTime}
            setFormOpenTime={setFormOpenTime}
            formCloseTime={formCloseTime}
            setFormCloseTime={setFormCloseTime}
            formStatus={formStatus}
            setFormStatus={setFormStatus}
            formContact={formContact}
            setFormContact={setFormContact}
            formWebsite={formWebsite}
            setFormWebsite={setFormWebsite}
            changedFields={changedFields}
            isNewUnit={isNewUnit}
            handleCancelEdit={handleCancelEdit}
            handleSaveChanges={handleSaveChanges}
            handleDeleteUnit={handleDeleteUnit}
            handleMapClick={handleMapClick}
            pinPlacement={pinPlacement}
          />
        )}
      </main>
    </div>
  );
}
