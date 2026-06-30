import React from "react";

interface SidebarProps {
  sidebarSearch: string;
  setSidebarSearch: (val: string) => void;
  activeTab: "dashboard" | "units" | "edit";
  setActiveTab: (tab: "dashboard" | "units" | "edit") => void;
  totalUnitsCount: number;
  totalBuildingsCount: number;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
  postUrl: string;
  userInitials: string;
  userName: string;
  userEmail: string;
  handleLogout: () => Promise<void>;
}

export function Sidebar({
  sidebarSearch,
  setSidebarSearch,
  activeTab,
  setActiveTab,
  totalUnitsCount,
  totalBuildingsCount,
  connectionStatus,
  postUrl,
  userInitials,
  userName,
  userEmail,
  handleLogout
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div>
        {/* Logo Brand */}
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" fill="var(--route)" stroke="var(--route)" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-sub">Direktori</span>
            <span className="logo-main">MãpDirectory</span>
          </div>
        </div>

        {/* Quick Search */}
        <div className="sidebar-search-container">
          <svg className="search-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Cari..."
            className="sidebar-search"
            value={sidebarSearch}
            onChange={(e) => {
              setSidebarSearch(e.target.value);
              if (activeTab !== "units") {
                setActiveTab("units");
              }
            }}
          />
          <span className="search-shortcut">⌘K</span>
        </div>

        {/* Navigation Section */}
        <nav>
          <h3 className="nav-section-title">Manage</h3>
          <ul className="nav-list">
            <li>
              <div
                className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("dashboard");
                  setSidebarSearch("");
                }}
              >
                <div className="nav-item-left">
                  <span className="nav-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="9" />
                      <rect x="14" y="3" width="7" height="5" />
                      <rect x="14" y="12" width="7" height="9" />
                      <rect x="3" y="16" width="7" height="5" />
                    </svg>
                  </span>
                  <span>Dashboard</span>
                </div>
              </div>
            </li>
            <li>
              <div
                className={`nav-item ${activeTab === "units" || activeTab === "edit" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("units");
                  setSidebarSearch("");
                }}
              >
                <div className="nav-item-left">
                  <span className="nav-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span>Units</span>
                </div>
                <span className="nav-item-badge">{totalUnitsCount}</span>
              </div>
            </li>
            <li>
              <a className="nav-item" href="#buildings" onClick={(e) => { e.preventDefault(); alert("Fitur kelola gedung sedang dalam tahap pengembangan."); }}>
                <div className="nav-item-left">
                  <span className="nav-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 3v18" />
                      <path d="M15 3v18" />
                      <path d="M3 9h18" />
                      <path d="M3 15h18" />
                    </svg>
                  </span>
                  <span>Buildings</span>
                </div>
                <span className="nav-item-badge">{totalBuildingsCount}</span>
              </a>
            </li>
            <li>
              <a className="nav-item" href="#categories" onClick={(e) => { e.preventDefault(); alert("Fitur kelola kategori sedang dalam tahap pengembangan."); }}>
                <div className="nav-item-left">
                  <span className="nav-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </span>
                  <span>Categories</span>
                </div>
              </a>
            </li>
            <li>
              <a className="nav-item" href="#settings" onClick={(e) => { e.preventDefault(); alert("Konfigurasi settings terproteksi untuk hak akses administrator utama."); }}>
                <div className="nav-item-left">
                  <span className="nav-item-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </span>
                  <span>Settings</span>
                </div>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="sidebar-footer">
        <div className={`api-status-card ${connectionStatus === "connected" ? "online" : "offline"}`} title={`MCP Post URL: ${postUrl || 'SSE disconnected'}`}>
          <div className="api-status-title">
            <span className={`status-dot ${connectionStatus === "connected" ? "pulsing" : ""}`}></span>
            <span>{connectionStatus === "connected" ? "API - Online" : "API - Connecting"}</span>
          </div>
          <div className="api-status-url">
            {connectionStatus === "connected" ? "api.kampus.ac.id • 142 ms" : "menghubungkan..."}
          </div>
        </div>

        {/* User Profile */}
        <div className="user-profile-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div className="user-avatar-circle">{userInitials}</div>
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: "none", border: "none", color: "var(--ink-3)", cursor: "pointer" }}
            title="Logout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
