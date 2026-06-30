import { useState, useEffect, useRef, useMemo } from "react";
import { Unit, Category, Building, ActivityLog } from "../../domain/entities/types";
import { unitRepositoryInstance } from "../../data/repositories/unit.repository.impl";

interface UseUnitFormProps {
  units: Unit[];
  categoriesList: Category[];
  buildingsList: Building[];
  fetchUnits: () => Promise<void>;
  setActivityLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  setActiveTab: (tab: "dashboard" | "units" | "edit") => void;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (msg: string) => void;
  setSelectedUnitIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useUnitForm({
  units,
  categoriesList,
  buildingsList,
  fetchUnits,
  setActivityLogs,
  setActiveTab,
  setIsLoading,
  setErrorMessage,
  setSelectedUnitIds
}: UseUnitFormProps) {
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

  // Memoized check if the active unit is a new unit
  const isNewUnit = useMemo(() => {
    if (!editingUnitId) return false;
    return !units.some((u) => u.id === editingUnitId);
  }, [editingUnitId, units]);

  // Cancel edits
  const handleCancelEdit = () => {
    setActiveTab("units");
    setEditingUnitId(null);
    originalUnitRef.current = null;
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!editingUnitId) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const selectedCat = categoriesList.find((c) => c.name === formCategory);
      const selectedBldg = buildingsList.find((b) => b.name === formBuilding);

      const isNewUnitVal = !units.some((u) => u.id === editingUnitId);

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

      const response = await unitRepositoryInstance.saveUnit(
        payload,
        isNewUnitVal,
        isNewUnitVal ? undefined : Number(editingUnitId)
      );

      if (!response.success) {
        throw new Error(response.error);
      }

      const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

      if (isNewUnitVal) {
        setActivityLogs((prev) => [
          {
            id: "l_" + Date.now(),
            user: "Rizky",
            action: "menambahkan",
            target: formName,
            time: nowTime,
            relativeTime: "Baru saja",
            initials: "R"
          },
          ...prev
        ]);
      } else {
        setActivityLogs((prev) => [
          {
            id: "l_" + Date.now(),
            user: "Rizky",
            action: "memperbarui",
            target: formName,
            time: nowTime,
            relativeTime: "Baru saja",
            initials: "R"
          },
          ...prev
        ]);
      }

      await fetchUnits();

      setLastSavedTime(nowTime);
      setShowAutoSaveToast(true);
      setTimeout(() => setShowAutoSaveToast(false), 3000);

      setActiveTab("units");
      setEditingUnitId(null);
      originalUnitRef.current = null;
    } catch (err: any) {
      console.error("Error executing database save:", err);
      setErrorMessage("Gagal menyimpan unit ke database: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete single unit
  const handleDeleteUnit = async (id: string) => {
    const isNewUnitVal = !units.some((u) => u.id === id);
    if (isNewUnitVal) {
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
        const response = await unitRepositoryInstance.deleteUnit(Number(id));
        if (!response.success) {
          throw new Error(response.error);
        }

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

        setSelectedUnitIds((prev) => prev.filter((uid) => uid !== id));
        await fetchUnits();

        setActiveTab("units");
        setEditingUnitId(null);
      } catch (err: any) {
        console.error("Error executing database delete:", err);
        setErrorMessage("Gagal menghapus unit: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Interactive SVG Map Click Coordinate Handler
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pixelWidth = rect.width;
    const pixelHeight = rect.height;

    const latDelta = ((y / pixelHeight) - 0.5) * -0.005; // inverse y
    const lngDelta = ((x / pixelWidth) - 0.5) * 0.005;

    const newLat = Number((-7.27543 + latDelta).toFixed(5));
    const newLng = Number((112.79742 + lngDelta).toFixed(5));

    setFormLat(newLat);
    setFormLng(newLng);
  };

  // Map coordinates to SVG placement
  const pinPlacement = useMemo(() => {
    const centerLat = -7.27543;
    const centerLng = 112.79742;

    const deltaLat = formLat - centerLat;
    const deltaLng = formLng - centerLng;

    const x = 200 + (deltaLng / 0.005) * 200;
    const y = 110 - (deltaLat / 0.005) * 110;

    return {
      x: Math.min(380, Math.max(20, x)),
      y: Math.min(200, Math.max(20, y))
    };
  }, [formLat, formLng]);

  return {
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
    zoomLevel,
    setZoomLevel,
    mapCenter,
    setMapCenter,
    showAutoSaveToast,
    setShowAutoSaveToast,
    lastSavedTime,
    setLastSavedTime,
    originalUnitRef,
    handleEditUnit,
    changedFields,
    isNewUnit,
    handleCancelEdit,
    handleSaveChanges,
    handleDeleteUnit,
    handleMapClick,
    pinPlacement
  };
}
