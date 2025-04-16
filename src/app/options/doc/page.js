"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Calendar,
  Filter,
  ChevronDown,
  Download,
  FileText,
  XIcon,
  Edit2,
  FileIcon,
  FileTextIcon,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  HeadingLevel,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";

// Searchable Select Component
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Rechercher...",
  emptyOptionLabel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find the current selected label
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || emptyOptionLabel;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-black" : "text-gray-500"}>
          {value ? selectedLabel : emptyOptionLabel}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto">
          <div className="sticky top-0 p-2 bg-white border-b">
            <input
              type="text"
              className="w-full px-3 py-2 text-black rounded-lg border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none"
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div>
            <div
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                onChange({ target: { value: "" } });
                setIsOpen(false);
                setSearchQuery("");
              }}
            >
              {emptyOptionLabel}
            </div>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    value === option.value ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onChange({ target: { value: option.value } });
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">
                Aucun résultat
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Column Selector Modal Component
function ColumnSelectorModal({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  setVisibleColumns,
}) {
  if (!isOpen) return null;

  const handleToggleColumn = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1B4D3E]">
            Gérer les colonnes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(columns).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50"
            >
              <input
                type="checkbox"
                id={`column-${key}`}
                checked={visibleColumns[key]}
                onChange={() => handleToggleColumn(key)}
                className="h-5 w-5 rounded border-gray-300 text-[#1B4D3E] focus:ring-[#1B4D3E]"
              />
              <label
                htmlFor={`column-${key}`}
                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
              >
                {label}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() =>
              setVisibleColumns(
                Object.fromEntries(
                  Object.keys(columns).map((key) => [key, true])
                )
              )
            }
            className="px-4 py-2 text-[#1B4D3E] border border-[#1B4D3E] rounded-xl hover:bg-[#1B4D3E] hover:text-white transition-colors"
          >
            Tout sélectionner
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1B4D3E] text-white rounded-xl hover:bg-[#153729] transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

// Export Title Modal Component
function ExportTitleModal({ isOpen, onClose, onConfirm, exportType }) {
  const [title, setTitle] = useState("Historique des Tests - Suivi médical");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(title);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1B4D3E]">
            {exportType === "pdf" ? "Exporter en PDF" : "Exporter en Word"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="documentTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Titre du document
            </label>
            <input
              type="text"
              id="documentTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
              placeholder="Entrez un titre pour le document"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#1B4D3E] text-white rounded-xl hover:bg-[#153729] transition-colors"
            >
              Exporter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TestHistory() {
  const router = useRouter();

  // Original state
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(true);
  const [horses, setHorses] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [testTypes, setTestTypes] = useState([
    "Coliques",
    "Locomoteur",
    "Dermatologie",
    "Blessures",
    "Digestif",
  ]);

  // Additional horse filters (from HorseList)
  const [filterEtat, setFilterEtat] = useState("");
  const [filterRace, setFilterRace] = useState("");
  const [filterRobe, setFilterRobe] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [filterPere, setFilterPere] = useState("");
  const [filterMere, setFilterMere] = useState("");
  const [filterTaille, setFilterTaille] = useState("");
  const [filterPuce, setFilterPuce] = useState("");
  const [filterProvenance, setFilterProvenance] = useState("");
  const [filterDetachement, setFilterDetachement] = useState("");

  // Export and column visibility state
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentExportType, setCurrentExportType] = useState(null); // 'pdf' or 'word'

  // New sort state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Column definitions - Added the new column "dateDeGuerison"
  const columns = {
    date: "Date",
    horse: "Cheval",
    matricule: "Matricule",
    type: "Type",
    dateDeGuerison: "Date de sortie", // New column
    updatedAt: "Date mise à jour",
    actions: "Actions",
  };

  // Visible columns state - Including the new column
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    horse: true,
    matricule: true,
    type: true,
    dateDeGuerison: true, // New column
    updatedAt: true,
    actions: true,
  });

  // Unique values for dropdowns
  const [uniqueRaces, setUniqueRaces] = useState([]);
  const [uniqueRobes, setUniqueRobes] = useState([]);
  const [uniqueDisciplines, setUniqueDisciplines] = useState([]);
  const [uniquePeres, setUniquePeres] = useState([]);
  const [uniqueMeres, setUniqueMeres] = useState([]);
  const [uniqueTailles, setUniqueTailles] = useState([]);
  const [uniquePuces, setUniquePuces] = useState([]);
  const [uniqueProvenances, setUniqueProvenances] = useState([]);
  const [uniqueDetachements, setUniqueDetachements] = useState([]);

  const handleEditTest = (test) => {
    router.push(`/options/edit-consultation?testId=${test._id}`);
  };

  // Add a new function for initial data fetch
  const fetchInitialTests = async () => {
    setLoading(true);
    try {
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/horse-test`);
      if (!response.ok) throw new Error("Failed to fetch tests");

      const { data } = await response.json();
      setTests(data || []);

      // Fetch horse data for filter options
      try {
        const horsesResponse = await fetch(`${BASE_URL}/horse`);
        if (horsesResponse.ok) {
          const { data: horsesData } = await horsesResponse.json();
          if (horsesData && horsesData.length > 0) {
            // Extract unique values for horse filters
            setUniqueRaces([
              ...new Set(horsesData.map((horse) => horse.race).filter(Boolean)),
            ]);
            setUniqueRobes([
              ...new Set(horsesData.map((horse) => horse.robe).filter(Boolean)),
            ]);
            setUniqueDisciplines([
              ...new Set(
                horsesData.map((horse) => horse.discipline).filter(Boolean)
              ),
            ]);
            setUniquePeres([
              ...new Set(
                horsesData
                  .map((horse) => horse.father?.name || horse.fatherText)
                  .filter(Boolean)
              ),
            ]);
            setUniqueMeres([
              ...new Set(
                horsesData
                  .map((horse) => horse.mother?.name || horse.motherText)
                  .filter(Boolean)
              ),
            ]);
            setUniqueTailles([
              ...new Set(
                horsesData.map((horse) => horse.Taille).filter(Boolean)
              ),
            ]);
            setUniquePuces([
              ...new Set(horsesData.map((horse) => horse.Puce).filter(Boolean)),
            ]);
            setUniqueProvenances([
              ...new Set(
                horsesData.map((horse) => horse.Provenance).filter(Boolean)
              ),
            ]);
            setUniqueDetachements([
              ...new Set(
                horsesData.map((horse) => horse.Detachement).filter(Boolean)
              ),
            ]);
          }
        }
      } catch (horsesError) {
        console.error("Error fetching horses data for filters:", horsesError);
      }

      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des tests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestTypes = async () => {
    try {
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/test-types`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Only update if we get more types than our default array
        if (data.data.length > testTypes.length) {
          setTestTypes(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching test types:", error);
      // Keep using default types if fetch fails
    }
  };

  // Add useEffect for initial load
  useEffect(() => {
    fetchInitialTests();
    fetchTestTypes();
  }, []);

  // Horse search with debounce
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const BASE_URL = "http://localhost:3001/api";
          const response = await fetch(
            `${BASE_URL}/horse?search=${encodeURIComponent(searchQuery)}`
          );
          if (!response.ok) throw new Error("Search failed");
          const data = await response.json();
          setHorses(data.data || []);
          setError(null);
        } catch (err) {
          setError("Erreur lors de la recherche des chevaux");
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setHorses([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Fetch tests with all filters
  const fetchTests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Original filters
      if (selectedHorse?._id) params.append("horseId", selectedHorse._id);
      if (dateRange.start) params.append("startDate", dateRange.start);
      if (dateRange.end) params.append("endDate", dateRange.end);
      if (selectedType) params.append("type", selectedType);

      // Horse filters
      if (filterEtat) params.append("etat", filterEtat);
      if (filterRace) params.append("race", filterRace);
      if (filterRobe) params.append("robe", filterRobe);
      if (filterDiscipline) params.append("discipline", filterDiscipline);
      if (filterAgeRange) params.append("ageRange", filterAgeRange);
      if (filterPere) params.append("pere", filterPere);
      if (filterMere) params.append("mere", filterMere);
      if (filterTaille) params.append("taille", filterTaille);
      if (filterPuce) params.append("puce", filterPuce);
      if (filterProvenance) params.append("provenance", filterProvenance);
      if (filterDetachement) params.append("detachement", filterDetachement);

      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/test?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tests");

      const { data } = await response.json();
      setTests(data || []);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des tests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if any filter is applied
  const isAnyFilterApplied = () => {
    return (
      selectedHorse ||
      dateRange.start ||
      dateRange.end ||
      selectedType ||
      filterEtat ||
      filterRace ||
      filterRobe ||
      filterDiscipline ||
      filterAgeRange ||
      filterPere ||
      filterMere ||
      filterTaille ||
      filterPuce ||
      filterProvenance ||
      filterDetachement
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedHorse(null);
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
    setSelectedType("");

    // Clear horse filters
    setFilterEtat("");
    setFilterRace("");
    setFilterRobe("");
    setFilterDiscipline("");
    setFilterAgeRange("");
    setFilterPere("");
    setFilterMere("");
    setFilterTaille("");
    setFilterPuce("");
    setFilterProvenance("");
    setFilterDetachement("");

    fetchInitialTests();
  };

  // Fetch tests when filters change
  useEffect(() => {
    if (isAnyFilterApplied()) {
      fetchTests();
    }
  }, [
    selectedHorse,
    dateRange.start,
    dateRange.end,
    selectedType,
    filterEtat,
    filterRace,
    filterRobe,
    filterDiscipline,
    filterAgeRange,
    filterPere,
    filterMere,
    filterTaille,
    filterPuce,
    filterProvenance,
    filterDetachement,
  ]);

  // New function to handle sorting
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sorted tests based on current sortConfig
  const sortedTests = React.useMemo(() => {
    if (!sortConfig.key) return tests;

    return [...tests].sort((a, b) => {
      // Handle different data types for different columns
      if (sortConfig.key === "date" || sortConfig.key === "updatedAt") {
        const aDate = a[sortConfig.key]
          ? new Date(a[sortConfig.key]).getTime()
          : 0;
        const bDate = b[sortConfig.key]
          ? new Date(b[sortConfig.key]).getTime()
          : 0;
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (sortConfig.key === "dateDeGuerison") {
        const aDate = a.dateDeGuerison
          ? new Date(a.dateDeGuerison).getTime()
          : 0;
        const bDate = b.dateDeGuerison
          ? new Date(b.dateDeGuerison).getTime()
          : 0;
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (sortConfig.key === "horse") {
        const aValue = a.horse.name.toLowerCase();
        const bValue = b.horse.name.toLowerCase();
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "matricule") {
        const aValue = a.horse.matricule?.toLowerCase() || "";
        const bValue = b.horse.matricule?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For other columns (like 'type')
      const aValue = a[sortConfig.key]?.toLowerCase() || "";
      const bValue = b[sortConfig.key]?.toLowerCase() || "";
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [tests, sortConfig]);

  // Export to CSV
  const handleExport = () => {
    try {
      if (tests.length === 0) {
        setError("Aucune donnée à exporter");
        return;
      }

      const csvData = tests.map((test) => {
        const data = {};

        if (visibleColumns.date)
          data["Date"] = new Date(test.date).toLocaleDateString("fr-FR");
        if (visibleColumns.horse) data["Nom du cheval"] = test.horse.name;
        if (visibleColumns.matricule)
          data["Matricule"] = test.horse.matricule || "";
        if (visibleColumns.type) data["Type"] = test.type;
        // Add the new column to CSV export
        if (visibleColumns.dateDeGuerison)
          data["Date de sortie"] = test.dateDeGuerison
            ? new Date(test.dateDeGuerison).toLocaleDateString("fr-FR")
            : "";
        if (visibleColumns.updatedAt)
          data["Mise à jour"] = test.updatedAt
            ? new Date(test.updatedAt).toLocaleDateString("fr-FR")
            : "";

        return data;
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = URL.createObjectURL(blob);
      link.download = `tests_${date}.csv`;
      link.click();
    } catch (err) {
      setError("Erreur lors de l'exportation");
      console.error(err);
    }
  };

  // Generate PDF with custom title
  const generatePDF = (customTitle) => {
    try {
      if (tests.length === 0) {
        setError("Aucune donnée à exporter");
        return;
      }

      // Create a new PDF document in landscape orientation
      const doc = new jsPDF("landscape");
      const date = new Date().toLocaleDateString("fr-FR");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Define columns based on visible columns
      let columns = [];
      if (visibleColumns.date)
        columns.push({ header: "Date", dataKey: "date" });
      if (visibleColumns.horse)
        columns.push({ header: "Cheval", dataKey: "horseName" });
      if (visibleColumns.matricule)
        columns.push({ header: "Matricule", dataKey: "matricule" });
      if (visibleColumns.type)
        columns.push({ header: "Type", dataKey: "type" });
      // Add the new column
      if (visibleColumns.dateDeGuerison)
        columns.push({ header: "Date de sortie", dataKey: "dateDeGuerison" });
      if (visibleColumns.updatedAt)
        columns.push({ header: "Mise à jour", dataKey: "updatedAt" });

      // Prepare data for the table
      const tableData = tests.map((test) => ({
        date: new Date(test.date).toLocaleDateString("fr-FR"),
        horseName: test.horse.name,
        matricule: test.horse.matricule || "---",
        type: test.type,
        // Include the new field in the table data
        dateDeGuerison: test.dateDeGuerison
          ? new Date(test.dateDeGuerison).toLocaleDateString("fr-FR")
          : "",
        updatedAt: test.updatedAt
          ? new Date(test.updatedAt).toLocaleDateString("fr-FR")
          : "",
      }));

      // Set font size for custom title
      doc.setFontSize(20);
      doc.setTextColor(27, 77, 62);

      // Calculate the width of the title text to center it
      const titleWidth =
        (doc.getStringUnitWidth(customTitle) * doc.getFontSize()) /
        doc.internal.scaleFactor;
      const titleX = (pageWidth - titleWidth) / 2;

      // Draw the centered title
      doc.text(customTitle, titleX, 22);

      // Set font for subtitle
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Exporté le: ${date}`, 14, 30);

      // Add filter information if applied
      let yPosition = 38;
      if (isAnyFilterApplied()) {
        doc.setFontSize(10);
        doc.text("Filtres appliqués:", 14, yPosition);
        yPosition += 6;

        if (selectedHorse) {
          doc.text(
            `- Cheval: ${selectedHorse.name} (${
              selectedHorse.matricule || "---"
            })`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        if (selectedType) {
          doc.text(`- Type: ${selectedType}`, 20, yPosition);
          yPosition += 5;
        }

        if (dateRange.start) {
          doc.text(
            `- Date début: ${new Date(dateRange.start).toLocaleDateString(
              "fr-FR"
            )}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        if (dateRange.end) {
          doc.text(
            `- Date fin: ${new Date(dateRange.end).toLocaleDateString(
              "fr-FR"
            )}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        // Horse filters
        if (filterEtat) {
          doc.text(`- État: ${filterEtat}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterRace) {
          doc.text(`- Race: ${filterRace}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterRobe) {
          doc.text(`- Robe: ${filterRobe}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterDiscipline) {
          doc.text(`- Discipline: ${filterDiscipline}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterAgeRange) {
          doc.text(`- Âge: ${filterAgeRange}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterPere) {
          doc.text(`- Père: ${filterPere}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterMere) {
          doc.text(`- Mère: ${filterMere}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterTaille) {
          doc.text(`- Taille: ${filterTaille}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterPuce) {
          doc.text(`- Puce: ${filterPuce}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterProvenance) {
          doc.text(`- Provenance: ${filterProvenance}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterDetachement) {
          doc.text(`- Detachement: ${filterDetachement}`, 20, yPosition);
          yPosition += 5;
        }

        yPosition += 5;
      }

      // Generate the table
      doc.autoTable({
        startY: yPosition,
        head: [columns.map((col) => col.header)],
        body: tableData.map((row) => columns.map((col) => row[col.dataKey])),
        didDrawPage: (data) => {
          // Header on each page
          const pageNumber = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Page ${pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            `Exporté le ${date}`,
            doc.internal.pageSize.width - 60,
            doc.internal.pageSize.height - 10
          );
        },
        margin: { top: 45 },
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: {
          fillColor: [27, 77, 62], // #1B4D3E
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        // Special styling for type column
        columnStyles: {
          type: {
            fontStyle: "bold",
            textColor: [0, 0, 128],
          },
        },
      });

      // Save the PDF
      doc.save(`tests_medicaux_${date.replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Erreur lors de l'exportation en PDF");
    }
  };

  // Generate Word document with custom title - Improved version
  const generateWord = async (customTitle) => {
    try {
      if (tests.length === 0) {
        setError("Aucune donnée à exporter");
        return;
      }

      // Create a simpler document structure
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: {
                  orientation: "landscape",
                },
                margin: {
                  top: 700,
                  right: 700,
                  bottom: 700,
                  left: 700,
                },
              },
            },
            children: [], // We'll add content here
          },
        ],
      });

      // Add title
      doc.addSection({
        children: [
          new Paragraph({
            text: customTitle,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Exporté le: ${new Date().toLocaleDateString("fr-FR")}`,
            alignment: AlignmentType.RIGHT,
          }),
          new Paragraph(""), // Empty paragraph for spacing
        ],
      });

      // Add filters information if any
      if (isAnyFilterApplied()) {
        const filterSection = [];

        filterSection.push(
          new Paragraph({
            text: "Filtres appliqués:",
            bold: true,
          })
        );

        if (selectedHorse) {
          filterSection.push(
            new Paragraph({
              text: `- Cheval: ${selectedHorse.name} (${
                selectedHorse.matricule || "---"
              })`,
              indent: { left: 360 },
            })
          );
        }

        if (selectedType) {
          filterSection.push(
            new Paragraph({
              text: `- Type: ${selectedType}`,
              indent: { left: 360 },
            })
          );
        }

        if (dateRange.start) {
          filterSection.push(
            new Paragraph({
              text: `- Date début: ${new Date(
                dateRange.start
              ).toLocaleDateString("fr-FR")}`,
              indent: { left: 360 },
            })
          );
        }

        if (dateRange.end) {
          filterSection.push(
            new Paragraph({
              text: `- Date fin: ${new Date(dateRange.end).toLocaleDateString(
                "fr-FR"
              )}`,
              indent: { left: 360 },
            })
          );
        }

        // Add horse filters
        const horseFilters = [
          { name: "État", value: filterEtat },
          { name: "Race", value: filterRace },
          { name: "Robe", value: filterRobe },
          { name: "Discipline", value: filterDiscipline },
          { name: "Âge", value: filterAgeRange },
          { name: "Père", value: filterPere },
          { name: "Mère", value: filterMere },
          { name: "Taille", value: filterTaille },
          { name: "Puce", value: filterPuce },
          { name: "Provenance", value: filterProvenance },
          { name: "Detachement", value: filterDetachement },
        ];

        horseFilters.forEach((filter) => {
          if (filter.value) {
            filterSection.push(
              new Paragraph({
                text: `- ${filter.name}: ${filter.value}`,
                indent: { left: 360 },
              })
            );
          }
        });

        filterSection.push(new Paragraph("")); // Add spacing

        // Add filter section to document
        doc.addSection({
          children: filterSection,
        });
      }

      // Create table for data
      const tableRows = [];

      // Add header row
      const headerCells = [];

      // Determine which columns to include
      if (visibleColumns.date) headerCells.push(createHeaderCell("Date"));
      if (visibleColumns.horse) headerCells.push(createHeaderCell("Cheval"));
      if (visibleColumns.matricule)
        headerCells.push(createHeaderCell("Matricule"));
      if (visibleColumns.type) headerCells.push(createHeaderCell("Type"));
      if (visibleColumns.dateDeGuerison)
        headerCells.push(createHeaderCell("Date de sortie"));
      if (visibleColumns.updatedAt)
        headerCells.push(createHeaderCell("Mise à jour"));

      // Add header row to table
      tableRows.push(new TableRow({ children: headerCells }));

      // Add data rows
      tests.forEach((test) => {
        const cells = [];

        if (visibleColumns.date) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph(new Date(test.date).toLocaleDateString("fr-FR")),
              ],
            })
          );
        }

        if (visibleColumns.horse) {
          cells.push(
            new TableCell({
              children: [new Paragraph(test.horse.name)],
            })
          );
        }

        if (visibleColumns.matricule) {
          cells.push(
            new TableCell({
              children: [new Paragraph(test.horse.matricule || "---")],
            })
          );
        }

        if (visibleColumns.type) {
          cells.push(
            new TableCell({
              children: [new Paragraph({ text: test.type, bold: true })],
            })
          );
        }

        // Add the new column to the Word table
        if (visibleColumns.dateDeGuerison) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph(
                  test.dateDeGuerison
                    ? new Date(test.dateDeGuerison).toLocaleDateString("fr-FR")
                    : ""
                ),
              ],
            })
          );
        }

        if (visibleColumns.updatedAt) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph(
                  test.updatedAt
                    ? new Date(test.updatedAt).toLocaleDateString("fr-FR")
                    : ""
                ),
              ],
            })
          );
        }

        tableRows.push(new TableRow({ children: cells }));
      });

      // Create table with all rows
      const table = new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      // Add table to document
      doc.addSection({
        children: [table],
      });

      try {
        // Generate the document and save it
        const date = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
        const buffer = await Packer.toBlob(doc);
        saveAs(buffer, `tests_medicaux_${date}.docx`);
      } catch (packError) {
        console.error("Error packing document:", packError);
        setError("Erreur lors de la création du document Word");
      }
    } catch (err) {
      console.error("Error generating Word document:", err);
      setError("Erreur lors de l'exportation en Word");
    }
  };

  // Helper function to create a header cell with consistent styling
  function createHeaderCell(text) {
    return new TableCell({
      children: [new Paragraph({ text, bold: true })],
      shading: { fill: "DDDDDD" }, // Using a lighter gray that's more compatible
    });
  }

  // Show export modal handlers
  const handleExportPDF = () => {
    setCurrentExportType("pdf");
    setShowExportModal(true);
  };

  const handleExportWord = () => {
    setCurrentExportType("word");
    setShowExportModal(true);
  };

  const handleExportConfirm = (title) => {
    setShowExportModal(false);

    if (currentExportType === "pdf") {
      generatePDF(title);
    } else if (currentExportType === "word") {
      generateWord(title);
    }
  };

  const handleDeleteTest = async (testId) => {
    const BASE_URL = "http://localhost:3001/api";

    try {
      const response = await fetch(`${BASE_URL}/test/${testId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            "Une erreur est survenue lors de la suppression du test"
        );
      }

      router.replace("/options/doc", { shallow: true });

      // Refresh the data
      if (isAnyFilterApplied()) {
        fetchTests();
      } else {
        fetchInitialTests();
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      setError(`Erreur: ${error.message}`);
    }
  };

  // Convert array data to options format for SearchableSelect
  const getSelectOptions = (items, emptyLabel) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => ({ value: item, label: item }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <div className="flex justify-between items-center mt-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B4D3E]">
                Historique des consultation
              </h1>
              <p className="text-gray-600 mt-2">Suivi médical des chevaux</p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowColumnSelector(true)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Colonnes
              </button>
              <button
                onClick={handleExport}
                disabled={tests.length === 0}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  tests.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                }`}
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
              <button
                onClick={handleExportPDF}
                disabled={tests.length === 0}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  tests.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                }`}
              >
                <FileIcon className="w-4 h-4" />
                Exporter PDF
              </button>
              <button
                onClick={handleExportWord}
                disabled={tests.length === 0}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  tests.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                }`}
              >
                <FileTextIcon className="w-4 h-4" />
                Exporter Word
              </button>
            </div>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Active Filters Display */}
        {isAnyFilterApplied() && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {selectedHorse && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Cheval: ${selectedHorse.name}`}
                <button
                  onClick={() => {
                    setSelectedHorse(null);
                    setSearchQuery("");
                  }}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {selectedType && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Type: ${selectedType}`}
                <button
                  onClick={() => setSelectedType("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {dateRange.start && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Début: ${new Date(dateRange.start).toLocaleDateString(
                  "fr-FR"
                )}`}
                <button
                  onClick={() =>
                    setDateRange((prev) => ({ ...prev, start: "" }))
                  }
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {dateRange.end && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Fin: ${new Date(dateRange.end).toLocaleDateString("fr-FR")}`}
                <button
                  onClick={() => setDateRange((prev) => ({ ...prev, end: "" }))}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}

            {/* Horse-related filters active tags */}
            {filterEtat && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`État: ${filterEtat}`}
                <button
                  onClick={() => setFilterEtat("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterRace && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Race: ${filterRace}`}
                <button
                  onClick={() => setFilterRace("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterRobe && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Robe: ${filterRobe}`}
                <button
                  onClick={() => setFilterRobe("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterDiscipline && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Discipline: ${filterDiscipline}`}
                <button
                  onClick={() => setFilterDiscipline("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterAgeRange && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Âge: ${filterAgeRange}`}
                <button
                  onClick={() => setFilterAgeRange("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterPere && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Père: ${filterPere}`}
                <button
                  onClick={() => setFilterPere("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterMere && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Mère: ${filterMere}`}
                <button
                  onClick={() => setFilterMere("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterTaille && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Taille: ${filterTaille}`}
                <button
                  onClick={() => setFilterTaille("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterPuce && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Puce: ${filterPuce}`}
                <button
                  onClick={() => setFilterPuce("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterProvenance && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Provenance: ${filterProvenance}`}
                <button
                  onClick={() => setFilterProvenance("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterDetachement && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Detachement: ${filterDetachement}`}
                <button
                  onClick={() => setFilterDetachement("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="text-sm text-[#1B4D3E] hover:text-[#153729] underline"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white/70 rounded-2xl p-6 shadow-md border border-gray-100 mb-8 z-50">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#1B4D3E]" />
              <h2 className="text-xl font-semibold text-[#1B4D3E]">Filtres</h2>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </div>

          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 z-50">
              {/* Horse Search */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cheval
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un cheval..."
                    className="w-full pl-12 pr-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!e.target.value) setSelectedHorse(null);
                    }}
                  />
                </div>

                {/* Search Results Dropdown with higher z-index */}
                {searchQuery.length >= 2 && !selectedHorse && (
                  <div className="absolute z-[70] w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        Recherche en cours...
                      </div>
                    ) : (
                      horses.length > 0 && (
                        <div className="max-h-60 overflow-auto">
                          {horses.map((horse) => (
                            <div
                              key={horse._id}
                              onClick={() => {
                                setSelectedHorse(horse);
                                setSearchQuery(
                                  `${horse.name} (${
                                    horse.matricule ?? "matricule non fourni"
                                  })`
                                );
                              }}
                              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="font-medium">{horse.name}</div>
                              <div className="text-sm text-gray-600">
                                Matricule: {horse.matricule || ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Test Type Select - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de consultation
                </label>
                <SearchableSelect
                  options={testTypes.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  placeholder="Rechercher un type..."
                  emptyOptionLabel="Tous les types"
                />
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Début
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-12 pr-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-12 text-black pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    min={dateRange.start}
                  />
                </div>
              </div>

              {/* État Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État de santé
                </label>
                <SearchableSelect
                  options={[
                    { value: "sain", label: "Sain" },
                    { value: "malade", label: "Malade" },
                    { value: "en rétablissement", label: "En rétablissement" },
                  ]}
                  value={filterEtat}
                  onChange={(e) => setFilterEtat(e.target.value)}
                  placeholder="Rechercher un état..."
                  emptyOptionLabel="Tous les états"
                />
              </div>

              {/* Race Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Race
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniqueRaces)}
                  value={filterRace}
                  onChange={(e) => setFilterRace(e.target.value)}
                  placeholder="Rechercher une race..."
                  emptyOptionLabel="Toutes les races"
                />
              </div>

              {/* Robe Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robe
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniqueRobes)}
                  value={filterRobe}
                  onChange={(e) => setFilterRobe(e.target.value)}
                  placeholder="Rechercher une robe..."
                  emptyOptionLabel="Toutes les robes"
                />
              </div>

              {/* Discipline Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniqueDisciplines)}
                  value={filterDiscipline}
                  onChange={(e) => setFilterDiscipline(e.target.value)}
                  placeholder="Rechercher une position..."
                  emptyOptionLabel="Toutes les positions"
                />
              </div>

              {/* Age Range Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge
                </label>
                <SearchableSelect
                  options={[
                    { value: "0-4", label: "0-4 ans" },
                    { value: "5-7", label: "5-7 ans" },
                    { value: "8-12", label: "8-12 ans" },
                    { value: "13-15", label: "13-15 ans" },
                    { value: "16-18", label: "16-18 ans" },
                    { value: "18-20", label: "18-20 ans" },
                    { value: ">20", label: "Plus de 20 ans" },
                  ]}
                  value={filterAgeRange}
                  onChange={(e) => setFilterAgeRange(e.target.value)}
                  placeholder="Rechercher un âge..."
                  emptyOptionLabel="Tous les âges"
                />
              </div>

              {/* Père Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Père
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniquePeres)}
                  value={filterPere}
                  onChange={(e) => setFilterPere(e.target.value)}
                  placeholder="Rechercher un père..."
                  emptyOptionLabel="Tous les pères"
                />
              </div>

              {/* Mère Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mère
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniqueMeres)}
                  value={filterMere}
                  onChange={(e) => setFilterMere(e.target.value)}
                  placeholder="Rechercher une mère..."
                  emptyOptionLabel="Toutes les mères"
                />
              </div>

              {/* Taille Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniqueTailles)}
                  value={filterTaille}
                  onChange={(e) => setFilterTaille(e.target.value)}
                  placeholder="Rechercher une taille..."
                  emptyOptionLabel="Toutes les tailles"
                />
              </div>

              {/* Puce Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puce
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniquePuces)}
                  value={filterPuce}
                  onChange={(e) => setFilterPuce(e.target.value)}
                  placeholder="Rechercher une puce..."
                  emptyOptionLabel="Toutes les puces"
                />
              </div>

              {/* Provenance Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provenance
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniqueProvenances)}
                  value={filterProvenance}
                  onChange={(e) => setFilterProvenance(e.target.value)}
                  placeholder="Rechercher une provenance..."
                  emptyOptionLabel="Toutes les provenances"
                />
              </div>

              {/* Detachement Filter - Now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detachement
                </label>
                <SearchableSelect
                  options={getSelectOptions(uniqueDetachements)}
                  value={filterDetachement}
                  onChange={(e) => setFilterDetachement(e.target.value)}
                  placeholder="Rechercher un detachement..."
                  emptyOptionLabel="Tous les detachements"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Table - Now with sortable columns */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 overflow-hidden z-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B4D3E] mx-auto mb-4"></div>
              Chargement des données...
            </div>
          ) : (
            <div className="overflow-x-auto z-10">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {visibleColumns.date && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("date")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          Date
                          {sortConfig.key === "date" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.horse && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("horse")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          Cheval
                          {sortConfig.key === "horse" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.matricule && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("matricule")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          Matricule
                          {sortConfig.key === "matricule" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.type && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("type")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          Type
                          {sortConfig.key === "type" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {/* Add new column to the table header with sorting */}
                    {visibleColumns.dateDeGuerison && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("dateDeGuerison")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          Date de sortie
                          {sortConfig.key === "dateDeGuerison" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.updatedAt && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("updatedAt")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          Date mise à jour
                          {sortConfig.key === "updatedAt" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.actions && (
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedTests.length > 0 ? (
                    sortedTests.map((test) => (
                      <tr
                        key={test._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {visibleColumns.date && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(test.date).toLocaleDateString("fr-FR")}
                          </td>
                        )}
                        {visibleColumns.horse && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {test.horse.name}
                          </td>
                        )}
                        {visibleColumns.matricule && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {test.horse.matricule || "---"}
                          </td>
                        )}
                        {visibleColumns.type && (
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {test.type}
                            </span>
                          </td>
                        )}
                        {/* Add new column to display dateDeGuerison */}
                        {visibleColumns.dateDeGuerison && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {test.dateDeGuerison
                              ? new Date(
                                  test.dateDeGuerison
                                ).toLocaleDateString("fr-FR")
                              : ""}
                          </td>
                        )}
                        {visibleColumns.updatedAt && (
                          <td className="px-6 py-4 text-sm">
                            {test.updatedAt?.replace("T", " ").substring(0, 16)}
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="px-6 py-4 text-sm text-center">
                            <button
                              onClick={() => handleEditTest(test)}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-green-600 hover:text-green-700 transition-colors gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTest(test._id);
                              }}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-red-600 transition-colors gap-2"
                            >
                              <XIcon className="w-5 h-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length
                        }
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {isAnyFilterApplied() ? (
                          <div className="flex flex-col items-center">
                            <p className="mb-2">
                              Aucun test trouvé pour les critères sélectionnés
                            </p>
                            <button
                              onClick={clearFilters}
                              className="text-[#1B4D3E] hover:text-[#153729] underline text-sm"
                            >
                              Effacer les filtres
                            </button>
                          </div>
                        ) : (
                          "Sélectionnez des filtres pour afficher les tests"
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Column Selector Modal */}
      <ColumnSelectorModal
        isOpen={showColumnSelector}
        onClose={() => setShowColumnSelector(false)}
        columns={columns}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
      />

      {/* Export Title Modal */}
      <ExportTitleModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onConfirm={handleExportConfirm}
        exportType={currentExportType}
      />
    </div>
  );
}
