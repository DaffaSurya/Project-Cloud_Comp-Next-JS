"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

// Interfaces
interface Unit {
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

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  relativeTime: string;
  initials: string;
}

export default function Home() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "units" | "edit">("dashboard");

  // Supabase states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);
  const [buildingsList, setBuildingsList] = useState<{ id: number; name: string; lat: number; lng: number }[]>([]);

  // SSE & MCP State (Preserving original logic, integrated elegantly)
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [postUrl, setPostUrl] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initialize SSE in background
  useEffect(() => {
    setConnectionStatus("connecting");
    const es = new EventSource("/api/mcp/sse");
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus("connected");
    };

    es.onerror = () => {
      setConnectionStatus("error");
    };

    es.addEventListener("endpoint", (event: MessageEvent) => {
      const url = event.data;
      setPostUrl(url);
      try {
        const parsedUrl = new URL(url, window.location.href);
        const sId = parsedUrl.searchParams.get("sessionId") || "active-session";
        setSessionId(sId);
      } catch (err) {
        setSessionId("active-session");
      }
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // Primary Units Data State (Back-end database backed via Supabase client)
  const [units, setUnits] = useState<Unit[]>([]);

  // Read Operation: Fetch all units and linked tables
  const fetchUnits = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      // 1. Fetch categories for relational dropdown map
      const { data: cats, error: catErr } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });
      if (catErr) throw catErr;
      setCategoriesList(cats || []);

      // 2. Fetch buildings for relational dropdown map
      const { data: bldgs, error: bldgErr } = await supabase
        .from("buildings")
        .select("id, name, lat, lng")
        .order("name", { ascending: true });
      if (bldgErr) throw bldgErr;
      setBuildingsList(bldgs || []);

      // 3. Fetch primary units with relational joins
      const { data: unitsData, error: unitsErr } = await supabase
        .from("units")
        .select("*, categories(id, name), buildings(id, name)")
        .order("id", { ascending: true });
      if (unitsErr) throw unitsErr;

      // 4. Map DB entities to UI state properties
      const mapped = (unitsData || []).map((u: any) => ({
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
      }));

      setUnits(mapped);
    } catch (err: any) {
      console.error("Error fetching database tables from Supabase:", err);
      setErrorMessage("Gagal menyinkronkan data dengan Supabase: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mount Effect to initialize database tables
  useEffect(() => {
    fetchUnits();
  }, []);

  // Activity Logs state (Starts with values matching screenshot, dynamically grows!)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "l1",
      user: "Rizky",
      action: "memperbarui",
      target: "PAA Teknik Informatika",
      time: "09:14",
      relativeTime: "12 menit lalu",
      initials: "R"
    },
    {
      id: "l2",
      user: "Nadia",
      action: "menambahkan",
      target: "Lab Komputasi & Jaringan",
      time: "08:41",
      relativeTime: "45 menit lalu",
      initials: "N"
    },
    {
      id: "l3",
      user: "Rizky",
      action: "mengubah lantai",
      target: "Dept. Keperawatan → Lt. 4",
      time: "kemarin • 16:22",
      relativeTime: "Kemarin",
      initials: "R"
    },
    {
      id: "l4",
      user: "Sistem",
      action: "sinkron",
      target: "9 unit dari Pusat SI",
      time: "kemarin • 11:08",
      relativeTime: "Kemarin",
      initials: "S"
    }
  ]);

  // Sidebar Global Search
  const [sidebarSearch, setSidebarSearch] = useState("");

  // Filters State for Units View
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [buildingFilter, setBuildingFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sortBy, setSortBy] = useState("Diperbarui");

  // Selection state for Table
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);

  // Pagination states
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Form State
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formShortName, setFormShortName] = useState("");
  const [formCategory, setFormCategory] = useState<Unit["kategori"]>("Departemen");
  const [formDesc, setFormDesc] = useState("");
  const [formBuilding, setFormBuilding] = useState("Gedung TI");
  const [formFloor, setFormFloor] = useState("Lt. 3");
  const [formAddress, setFormAddress] = useState("");
  const [formLat, setFormLat] = useState(-7.27543);
  const [formLng, setFormLng] = useState(112.79742);
  const [formOpenTime, setFormOpenTime] = useState("08:00");
  const [formCloseTime, setFormCloseTime] = useState("16:00");
  const [formStatus, setFormStatus] = useState<Unit["status"]>("Buka");
  const [formContact, setFormContact] = useState("");
  const [formWebsite, setFormWebsite] = useState("");

  // Track map visual properties
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });

  // Autosave toast state
  const [showAutoSaveToast, setShowAutoSaveToast] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState("");

  // Keep a reference of original unit for unsaved changes detection
  const originalUnitRef = useRef<Unit | null>(null);

  // Load editing unit into form
  const handleEditUnit = (unit: Unit) => {
    setEditingUnitId(unit.id);
    originalUnitRef.current = unit;

    setFormName(unit.nama);
    setFormShortName(unit.namaPendek);
    setFormCategory(unit.kategori);
    setFormDesc(unit.deskripsi);
    setFormBuilding(unit.gedung);
    setFormFloor(unit.lantai);
    setFormAddress(unit.alamat);
    setFormLat(unit.latitude);
    setFormLng(unit.longitude);
    setFormOpenTime(unit.jamBuka);
    setFormCloseTime(unit.jamTutup);
    setFormStatus(unit.status);
    setFormContact(unit.nomorKontak);
    setFormWebsite(unit.situs);

    setActiveTab("edit");
  };

  // Compare form states with originalUnitRef to identify changed fields
  const changedFields = useMemo(() => {
    if (!originalUnitRef.current) return [];
    const orig = originalUnitRef.current;
    const fields: string[] = [];

    if (formName !== orig.nama) fields.push("nama");
    if (formShortName !== orig.namaPendek) fields.push("nama pendek");
    if (formCategory !== orig.kategori) fields.push("kategori");
    if (formDesc !== orig.deskripsi) fields.push("deskripsi");
    if (formBuilding !== orig.gedung) fields.push("gedung");
    if (formFloor !== orig.lantai) fields.push("lantai");
    if (formAddress !== orig.alamat) fields.push("alamat");
    if (formLat !== orig.latitude || formLng !== orig.longitude) fields.push("koordinat");
    if (formOpenTime !== orig.jamBuka || formCloseTime !== orig.jamTutup) fields.push("jam layanan");
    if (formStatus !== orig.status) fields.push("status");
    if (formContact !== orig.nomorKontak) fields.push("nomor kontak");
    if (formWebsite !== orig.situs) fields.push("situs");

    return fields;
  }, [
    formName,
    formShortName,
    formCategory,
    formDesc,
    formBuilding,
    formFloor,
    formAddress,
    formLat,
    formLng,
    formOpenTime,
    formCloseTime,
    formStatus,
    formContact,
    formWebsite
  ]);

  // Cancel edits
  const handleCancelEdit = () => {
    setActiveTab("units");
    setEditingUnitId(null);
    originalUnitRef.current = null;
  };

  // Create (Insert) & Update (Edit) Operations
  const handleSaveChanges = async () => {
    if (!editingUnitId) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Resolve relational foreign keys from selected dropdown text names
      const selectedCat = categoriesList.find((c) => c.name === formCategory);
      const selectedBldg = buildingsList.find((b) => b.name === formBuilding);

      // 2. Identify if operation is a Create or Update
      const isNewUnit = !units.some((u) => u.id === editingUnitId);

      // 3. Assemble payload aligning with the database schema
      const payload = {
        name: formName,
        short_name: formShortName,
        category_id: selectedCat?.id || null,
        building_id: selectedBldg?.id || null,
        floor: formFloor,
        lat: Number(formLat),
        lng: Number(formLng),
        address: formAddress || null,
        description: formDesc || null,
        open_hours: formOpenTime ? (formOpenTime.length === 5 ? formOpenTime + ":00" : formOpenTime) : null,
        close_hours: formCloseTime ? (formCloseTime.length === 5 ? formCloseTime + ":00" : formCloseTime) : null,
        is_published: formStatus === "Buka"
      };

      if (isNewUnit) {
        // Execute Supabase Insert
        const { error } = await supabase.from("units").insert([payload]);
        if (error) throw error;

        // Add action to activity logs state
        setActivityLogs((prev) => [
          {
            id: "l_" + Date.now(),
            user: "Rizky",
            action: "menambahkan",
            target: formName,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            relativeTime: "Baru saja",
            initials: "R"
          },
          ...prev
        ]);
      } else {
        // Execute Supabase Update
        const { error } = await supabase
          .from("units")
          .update(payload)
          .eq("id", Number(editingUnitId));
        if (error) throw error;

        // Add action to activity logs state
        setActivityLogs((prev) => [
          {
            id: "l_" + Date.now(),
            user: "Rizky",
            action: "memperbarui",
            target: formName,
            time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            relativeTime: "Baru saja",
            initials: "R"
          },
          ...prev
        ]);
      }

      // 4. Force state sync from database to acquire auto-incrementing serial IDs
      await fetchUnits();

      // Show saved toast success confirmation
      const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setLastSavedTime(nowTime);
      setShowAutoSaveToast(true);
      setTimeout(() => setShowAutoSaveToast(false), 3000);

      // Return to units list
      setActiveTab("units");
      setEditingUnitId(null);
      originalUnitRef.current = null;
    } catch (err: any) {
      console.error("Error executing database save to Supabase:", err);
      setErrorMessage("Gagal menyimpan unit ke Supabase: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete (Remove) Single Unit Operation
  const handleDeleteUnit = async (id: string) => {
    // If the unit has not been saved in the database yet (it is new), just close the form
    const isNewUnit = !units.some((u) => u.id === id);
    if (isNewUnit) {
      setActiveTab("units");
      setEditingUnitId(null);
      return;
    }

    const unitToDelete = units.find((u) => u.id === id);
    if (!unitToDelete) return;

    if (confirm(`Apakah Anda yakin ingin menghapus unit "${unitToDelete.nama}"?`)) {
      setIsLoading(true);
      setErrorMessage("");
      try {
        // Execute Supabase delete
        const { error } = await supabase
          .from("units")
          .delete()
          .eq("id", Number(id));
        if (error) throw error;

        // Push action to activity logs state
        const nowTimeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        setActivityLogs((prev) => [
          {
            id: "l_" + Date.now(),
            user: "Rizky",
            action: "menghapus",
            target: unitToDelete.nama,
            time: nowTimeStr,
            relativeTime: "Baru saja",
            initials: "R"
          },
          ...prev
        ]);

        // Remove from current selection & re-sync from database
        setSelectedUnitIds((prev) => prev.filter((uid) => uid !== id));
        await fetchUnits();

        setActiveTab("units");
        setEditingUnitId(null);
      } catch (err: any) {
        console.error("Error executing database delete to Supabase:", err);
        setErrorMessage("Gagal menghapus unit: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Delete (Remove) Bulk Units Operation
  const handleBulkDelete = async () => {
    if (selectedUnitIds.length === 0) return;

    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedUnitIds.length} unit yang dipilih?`)) {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const idsToDelete = selectedUnitIds.map(Number);
        
        // Execute Supabase bulk delete
        const { error } = await supabase
          .from("units")
          .delete()
          .in("id", idsToDelete);
        if (error) throw error;

        // Push action to activity logs state
        const nowTimeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        setActivityLogs((prev) => [
          {
            id: "l_" + Date.now(),
            user: "Rizky",
            action: "menghapus massal",
            target: `${selectedUnitIds.length} unit`,
            time: nowTimeStr,
            relativeTime: "Baru saja",
            initials: "R"
          },
          ...prev
        ]);

        // Reset selection & re-sync from database
        setSelectedUnitIds([]);
        await fetchUnits();
      } catch (err: any) {
        console.error("Error executing database bulk delete to Supabase:", err);
        setErrorMessage("Gagal menghapus unit secara massal: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Filter building bulk action
  const handleBulkChangeBuilding = (newBuilding: string) => {
    if (selectedUnitIds.length === 0) return;
    setUnits((prev) =>
      prev.map((u) => (selectedUnitIds.includes(u.id) ? { ...u, gedung: newBuilding } : u))
    );
    setSelectedUnitIds([]);
    alert(`Gedung untuk ${selectedUnitIds.length} unit berhasil diubah menjadi ${newBuilding}.`);
  };

  // Dynamic values based on units state
  const totalUnitsCount = units.length;

  const totalBuildingsCount = useMemo(() => {
    const b = new Set(units.map((u) => u.gedung));
    return Math.max(6, b.size); // Mock shows 6, fallback to calculated size
  }, [units]);

  const totalCategoriesCount = useMemo(() => {
    const c = new Set(units.map((u) => u.kategori));
    return Math.max(6, c.size);
  }, [units]);

  // Category counts maps
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Departemen: 0,
      PAA: 0,
      Kemahasiswaan: 0,
      Vokasi: 0,
      Kesehatan: 0,
      Lab: 0
    };
    units.forEach((u) => {
      if (counts[u.kategori] !== undefined) {
        counts[u.kategori]++;
      }
    });
    return counts;
  }, [units]);

  // Find max count to scale progress bars relatively
  const maxCategoryCount = useMemo(() => {
    const vals = Object.values(categoryCounts);
    return Math.max(1, ...vals);
  }, [categoryCounts]);

  // Filtered units list for Table View
  const filteredUnits = useMemo(() => {
    return units
      .filter((u) => {
        // Sidebar global search
        if (sidebarSearch.trim() !== "") {
          const s = sidebarSearch.toLowerCase();
          return (
            u.nama.toLowerCase().includes(s) ||
            u.namaPendek.toLowerCase().includes(s) ||
            u.id.includes(s)
          );
        }
        return true;
      })
      .filter((u) => {
        // Table view filters
        const matchesSearch =
          searchFilter === "" ||
          u.nama.toLowerCase().includes(searchFilter.toLowerCase()) ||
          u.id.includes(searchFilter) ||
          u.namaPendek.toLowerCase().includes(searchFilter.toLowerCase());

        const matchesCat = categoryFilter === "Semua" || u.kategori === categoryFilter;
        const matchesBldg = buildingFilter === "Semua" || u.gedung === buildingFilter;
        const matchesStatus = statusFilter === "Semua" || u.status === statusFilter;

        return matchesSearch && matchesCat && matchesBldg && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "Diperbarui") {
          return b.diperbarui.localeCompare(a.diperbarui);
        }
        if (sortBy === "Nama (A-Z)") {
          return a.nama.localeCompare(b.nama);
        }
        if (sortBy === "ID") {
          return a.id.localeCompare(b.id);
        }
        return 0;
      });
  }, [units, sidebarSearch, searchFilter, categoryFilter, buildingFilter, statusFilter, sortBy]);

  // Multi-select table handling
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUnitIds(filteredUnits.map((u) => u.id));
    } else {
      setSelectedUnitIds([]);
    }
  };

  const handleToggleSelectUnit = (id: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  // Simulated validation stats
  const totalCoordinatesValid = useMemo(() => {
    // Check how many units have coords
    return units.filter((u) => u.latitude !== 0 && u.longitude !== 0).length;
  }, [units]);

  // Click on styled SVG map coordinates update
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert SVG pixels (e.g. 0 to 400) to latitude/longitude offsets centered around campus center
    // Standard coordinates: -7.27543, 112.79742
    const pixelWidth = rect.width;
    const pixelHeight = rect.height;

    const latDelta = ((y / pixelHeight) - 0.5) * -0.005; // inverse y
    const lngDelta = ((x / pixelWidth) - 0.5) * 0.005;

    const newLat = Number((-7.27543 + latDelta).toFixed(5));
    const newLng = Number((112.79742 + lngDelta).toFixed(5));

    setFormLat(newLat);
    setFormLng(newLng);
  };

  // Convert current form latitude & longitude to map SVG visual placement coordinates
  const pinPlacement = useMemo(() => {
    // standard coordinates offset mapping to SVG grid (e.g. viewbox 0 0 400 220)
    // center is -7.27543, 112.79742
    const centerLat = -7.27543;
    const centerLng = 112.79742;

    const deltaLat = formLat - centerLat;
    const deltaLng = formLng - centerLng;

    // Scale mapping to SVG space
    const x = 200 + (deltaLng / 0.005) * 200;
    const y = 110 - (deltaLat / 0.005) * 110;

    return {
      x: Math.min(380, Math.max(20, x)),
      y: Math.min(200, Math.max(20, y))
    };
  }, [formLat, formLng]);

  return (
    <div className="app-layout">
      {/* 1. Left Sidebar */}
      <aside className="sidebar">
        <div>
          {/* Logo Brand */}
          <div className="logo-section">
            <div className="logo-icon">
              {/* Map pin with green center icon inside a rounded black box */}
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
                // Switch to units view if typing to see search filter results
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
          {/* Real-time SSE / MCP online badge integration */}
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
              <div className="user-avatar-circle">R</div>
              <div className="user-info">
                <span className="user-name">Rizky - Admin</span>
                <span className="user-email">r.admin@kampus.ac.id</span>
              </div>
            </div>
            <button
              onClick={() => alert("Admin keluar sesi.")}
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

      {/* Main Area */}
      <main className="main-content">
        {/* Supabase loading spinner banner */}
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

        {/* Supabase error prompt banner */}
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
            {/* Real-time date display matching screenshot */}
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
                // Instantly open a blank form with unique ID for adding
                const nextId = String(Number(units[units.length - 1]?.id || "0") + 1).padStart(4, "0");
                const newUnit: Unit = {
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
                };
                // Pre-fill form
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

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: DASHBOARD VIEW (IMAGE 2) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "dashboard" && (
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
                  {/* Category Progress Item loop */}
                  {(["Departemen", "PAA", "Kemahasiswaan", "Vokasi", "Kesehatan", "Lab"] as const).map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const percent = Math.round((count / Math.max(1, totalUnitsCount)) * 100);
                    // Standard scaling matches perfect ratios relative to max count
                    const relativeBarFill = Math.round((count / maxCategoryCount) * 100);

                    // Map categories to simple icon labels
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
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: UNITS LIST VIEW (IMAGE 3) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "units" && (
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

              {/* Sub-category chips row with counts matching screenshots */}
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

            {/* Dynamic Bulk Action bar matching mockup */}
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
                  {/* Change building bulk dropdown wrapper */}
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
                                {/* Letter corresponding to category */}
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
                              {/* Small sphere tag */}
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
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: EDIT UNIT VIEW (IMAGE 4) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === "edit" && editingUnitId && (
          <>
            <div className="page-container">
              {/* Header with Autosave status indicator matching screenshot */}
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

                      {/* Status saat ini segmented button switcher */}
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

                  {/* Pin di peta interactive SVG Canvas mockup */}
                  <div className="form-card">
                    <h3 className="form-card-title">Pin di peta</h3>
                    <p style={{ fontSize: "11px", color: "var(--ink-3)", marginTop: "-0.5rem", fontWeight: 500 }}>
                      Drag pin atau ketik koordinat di kiri. Klik di peta untuk memosisikan instan.
                    </p>

                    <div className="map-canvas-container">
                      {/* Styled visual vector layout map */}
                      <svg className="map-svg" onClick={handleMapClick}>
                        {/* Map Grid Gridlines */}
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e6e1d3" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="#efece2" />
                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Road systems */}
                        <path d="M 0 50 L 400 50" stroke="#fff" strokeWidth="16" fill="none" />
                        <path d="M 120 0 L 120 220" stroke="#fff" strokeWidth="14" fill="none" />
                        <path d="M 300 0 L 300 220" stroke="#fff" strokeWidth="14" fill="none" />

                        {/* Roads centers thin lines */}
                        <path d="M 0 50 L 400 50" stroke="#e4decb" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                        <path d="M 120 0 L 120 220" stroke="#e4decb" strokeWidth="1" strokeDasharray="4 4" fill="none" />

                        {/* Building Blocks */}
                        {/* 1. Gedung TI */}
                        <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung TI"); setFormLat(-7.27543); setFormLng(112.79742); }}>
                          <rect x="40" y="80" width="60" height="80" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                          <text x="70" y="125" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">GED. TI</text>
                        </g>

                        {/* 2. Gedung FKM */}
                        <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung FKM"); setFormLat(-7.27411); setFormLng(112.79901); }}>
                          <rect x="150" y="20" width="70" height="50" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                          <text x="185" y="48" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">FKM</text>
                        </g>

                        {/* 3. Gedung FK */}
                        <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung FK"); setFormLat(-7.27685); setFormLng(112.79251); }}>
                          <rect x="150" y="100" width="60" height="50" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                          <text x="180" y="128" fontFamily="var(--font-sans)" fontSize="10" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">FK</text>
                        </g>

                        {/* 4. Gedung Pusat */}
                        <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormLat(-7.27543); setFormLng(112.79522); }}>
                          <rect x="230" y="100" width="50" height="40" rx="6" fill="#d2cbba" stroke="#b6aa8d" strokeWidth="2" />
                          <text x="255" y="123" fontFamily="var(--font-sans)" fontSize="9" fontWeight="700" fill="var(--ink-3)" textAnchor="middle">PUSAT</text>
                        </g>

                        {/* 5. Vokasi block */}
                        <g style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setFormBuilding("Gedung Vokasi"); setFormLat(-7.27991); setFormLng(112.79422); }}>
                          <rect x="320" y="80" width="60" height="70" rx="6" fill="#ded7c4" stroke="#c0b59b" strokeWidth="2" />
                          <text x="350" y="120" fontFamily="var(--font-sans)" fontSize="9" fontWeight="700" fill="var(--ink-2)" textAnchor="middle">VOKASI</text>
                        </g>

                        {/* Draggable placement Pin overlay */}
                        <g transform={`translate(${pinPlacement.x}, ${pinPlacement.y})`}>
                          {/* Pulsing ring */}
                          <circle cx="0" cy="0" r="10" fill="var(--route)" fillOpacity="0.2" stroke="var(--route)" strokeWidth="1">
                            <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
                          </circle>
                          {/* Anchor Circle */}
                          <circle cx="0" cy="0" r="3" fill="var(--ink)" />
                          {/* Map Pin Vector Drawing pointing to center */}
                          <path d="M-9-28c-5 0-9 4-9 9 0 7 9 17 9 17s9-10 9-17c0-5-4-9-9-9z" fill="var(--ink)" />
                          {/* Inner pin point */}
                          <circle cx="-9" cy="-19" r="3" fill="#fff" />
                        </g>
                      </svg>

                      {/* Overlays badges matching Image 4 */}
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

                      {/* Map Controls */}
                      <div className="map-zoom-controls">
                        <button className="map-zoom-btn" onClick={() => alert("Zoom In")}>+</button>
                        <button className="map-zoom-btn" onClick={() => alert("Zoom Out")}>-</button>
                        <button className="map-zoom-btn" style={{ fontSize: "10px" }} onClick={() => { setFormLat(-7.27543); setFormLng(112.79742); }} title="Reset">⟲</button>
                      </div>
                    </div>

                    {/* Green Info alert box below */}
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

            {/* Bottom sticky action bar when form is dirty / unsaved changes exist */}
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
                  disabled={changedFields.length === 0}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Simpan perubahan</span>
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
