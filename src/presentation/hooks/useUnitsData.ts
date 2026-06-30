import { useState, useEffect, useMemo } from "react";
import { Unit, ActivityLog, Category, Building } from "../../domain/entities/types";
import { unitRepositoryInstance } from "../../data/repositories/unit.repository.impl";

export function useUnitsData() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [buildingsList, setBuildingsList] = useState<Building[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Activity Logs state (Initial values matching original code, dynamically grows!)
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

  // Fetch all units, categories, buildings
  const fetchUnits = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const cats = await unitRepositoryInstance.getCategories();
      setCategoriesList(cats);

      const bldgs = await unitRepositoryInstance.getBuildings();
      setBuildingsList(bldgs);

      const unitsData = await unitRepositoryInstance.getUnits();
      setUnits(unitsData);
    } catch (err: any) {
      console.error("Error fetching database tables:", err);
      setErrorMessage("Gagal menyinkronkan data dengan Supabase: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedUnitIds.length === 0) return;

    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedUnitIds.length} unit yang dipilih?`)) {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const idsToDelete = selectedUnitIds.map(Number);
        const response = await unitRepositoryInstance.bulkDeleteUnits(idsToDelete);
        if (!response.success) {
          throw new Error(response.error);
        }

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

        setSelectedUnitIds([]);
        await fetchUnits();
      } catch (err: any) {
        console.error("Error executing database bulk delete:", err);
        setErrorMessage("Gagal menghapus unit secara massal: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Bulk Change Building
  const handleBulkChangeBuilding = (newBuilding: string) => {
    if (selectedUnitIds.length === 0) return;
    setUnits((prev) =>
      prev.map((u) => (selectedUnitIds.includes(u.id) ? { ...u, gedung: newBuilding } : u))
    );
    setSelectedUnitIds([]);
    alert(`Gedung untuk ${selectedUnitIds.length} unit berhasil diubah menjadi ${newBuilding}.`);
  };

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

  // Memoized calculations
  const totalUnitsCount = units.length;

  const totalBuildingsCount = useMemo(() => {
    const b = new Set(units.map((u) => u.gedung));
    return Math.max(6, b.size);
  }, [units]);

  const totalCategoriesCount = useMemo(() => {
    const c = new Set(units.map((u) => u.kategori));
    return Math.max(6, c.size);
  }, [units]);

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

  const maxCategoryCount = useMemo(() => {
    const vals = Object.values(categoryCounts);
    return Math.max(1, ...vals);
  }, [categoryCounts]);

  const filteredUnits = useMemo(() => {
    return units
      .filter((u) => {
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

  const totalCoordinatesValid = useMemo(() => {
    return units.filter((u) => u.latitude !== 0 && u.longitude !== 0).length;
  }, [units]);

  return {
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
  };
}
