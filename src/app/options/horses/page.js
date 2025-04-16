"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  ArrowRight,
  XIcon,
  BriefcaseMedicalIcon,
  Eye,
  EyeOff,
  PenIcon,
  FileIcon,
  FileTextIcon,
  SlidersHorizontal,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Papa from "papaparse";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
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

// Search Parameters Handler Component
function SearchParamsHandler({ onParamsChange }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = {
      etat: searchParams.get("etat")
        ? decodeURIComponent(searchParams.get("etat"))
        : "",
      race: searchParams.get("race")
        ? decodeURIComponent(searchParams.get("race"))
        : "",
      robe: searchParams.get("robe")
        ? decodeURIComponent(searchParams.get("robe"))
        : "",
      discipline: searchParams.get("discipline")
        ? decodeURIComponent(searchParams.get("discipline"))
        : "",
      ageRange: searchParams.get("ageRange")
        ? decodeURIComponent(searchParams.get("ageRange"))
        : "",
      pere: searchParams.get("pere")
        ? decodeURIComponent(searchParams.get("pere"))
        : "",
      mere: searchParams.get("mere")
        ? decodeURIComponent(searchParams.get("mere"))
        : "",
      taille: searchParams.get("taille")
        ? decodeURIComponent(searchParams.get("taille"))
        : "",
      provenance: searchParams.get("provenance")
        ? decodeURIComponent(searchParams.get("provenance"))
        : "",
      detachement: searchParams.get("detachement")
        ? decodeURIComponent(searchParams.get("detachement"))
        : "",
    };

    if (Object.values(params).some((value) => value !== "")) {
      onParamsChange(params);
    }
  }, [searchParams, onParamsChange]);

  return null;
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
  const [title, setTitle] = useState("Registre des Chevaux");

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

// Main Component - Initial Setup
export default function HorseList() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(true);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEtatColumn, setShowEtatColumn] = useState(true);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentExportType, setCurrentExportType] = useState(null); // 'pdf' or 'word'

  // Add sort state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Column definitions with display names
  const columns = {
    horseId: "Id",
    name: "Nom",
    pere: "Père",
    mere: "Mère",
    matricule: "Matricule",
    taille: "Taille",
    puce: "Puce",
    provenance: "Provenance",
    detachement: "Detachement",
    race: "Race",
    robe: "Robe",
    etat: "État",
    age: "Âge",
    sex: "Sexe",
    discipline: "Position",
    updatedAt: "Mise à jour",
  };

  // Visible columns state
  const [visibleColumns, setVisibleColumns] = useState({
    horseId: true,
    name: true,
    pere: true,
    mere: true,
    matricule: true,
    taille: true,
    puce: true,
    provenance: true,
    detachement: true,
    race: true,
    robe: true,
    etat: true,
    age: true,
    sex: true,
    discipline: true,
    updatedAt: true,
  });

  // Updated filters state - removed puce filter
  const [filters, setFilters] = useState({
    search: "",
    race: "",
    robe: "",
    etat: "",
    discipline: "",
    ageRange: "",
    pere: "",
    mere: "",
    taille: "",
    provenance: "",
    detachement: "",
  });

  // Helper Functions
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const filterByAge = (horses) => {
    if (!filters.ageRange) return horses;

    let min = 0;
    let max = 100;

    switch (filters.ageRange) {
      case "0-4":
        min = 0;
        max = 4;
        break;
      case "5-7":
        min = 5;
        max = 7;
        break;
      case "8-12":
        min = 8;
        max = 12;
        break;
      case "13-15":
        min = 13;
        max = 15;
        break;
      case "16-18":
        min = 16;
        max = 18;
        break;
      case "18-20":
        min = 18;
        max = 20;
        break;
      case ">20":
        min = 21;
        max = 100;
        break;
      default:
        return horses;
    }

    return horses.filter((horse) => {
      const age = calculateAge(horse.birthDate);
      return age >= min && age <= max;
    });
  };

  // Request sort function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Sorted horses based on current sortConfig
  const sortedHorses = React.useMemo(() => {
    if (!sortConfig.key) return horses;

    return [...horses].sort((a, b) => {
      // Special cases for non-direct properties
      if (sortConfig.key === "pere") {
        const aValue = (a.father?.name || a.fatherText || "").toLowerCase();
        const bValue = (b.father?.name || b.fatherText || "").toLowerCase();
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "mere") {
        const aValue = (a.mother?.name || a.motherText || "").toLowerCase();
        const bValue = (b.mother?.name || b.motherText || "").toLowerCase();
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "age") {
        const aAge = calculateAge(a.birthDate);
        const bAge = calculateAge(b.birthDate);
        return sortConfig.direction === "asc" ? aAge - bAge : bAge - aAge;
      }

      if (sortConfig.key === "updatedAt") {
        const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      // For taille, puce, provenance, detachement which use capitalized property names
      if (
        ["taille", "puce", "provenance", "detachement"].includes(sortConfig.key)
      ) {
        const capitalizedKey =
          sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1);
        const aValue = (a[capitalizedKey] || "").toLowerCase();
        const bValue = (b[capitalizedKey] || "").toLowerCase();
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For regular string properties
      const aValue = String(a[sortConfig.key] || "").toLowerCase();
      const bValue = String(b[sortConfig.key] || "").toLowerCase();
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [horses, sortConfig]);

  // Convert array data to options format for SearchableSelect
  const getSelectOptions = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => ({ value: item, label: item }));
  };

  // Handlers and Data Fetching
  const handleParamsChange = (newParams) => {
    setFilters((prev) => ({
      ...prev,
      ...newParams,
    }));
  };

  const fetchHorses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "ageRange") params.append(key, value);
      });

      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/horse?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch horses");
      }

      const { data } = await response.json();
      const filteredHorses = filterByAge(data || []);
      setHorses(filteredHorses);
      setError(null);
    } catch (err) {
      console.error("Error fetching horses:", err);
      setError("Erreur lors du chargement des chevaux");
      setHorses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchHorses();
    }, 300);

    return () => clearTimeout(debounce);
  }, [filters]);

  useEffect(() => {
    // Update visibleColumns when showEtatColumn changes
    setVisibleColumns((prev) => ({
      ...prev,
      etat: showEtatColumn,
    }));
  }, [showEtatColumn]);

  const handleExport = async () => {
    try {
      if (horses.length === 0) {
        setError("Aucune donnée à exporter");
        return;
      }

      const csvData = horses.map((horse) => {
        const data = {};

        if (visibleColumns.name) data["Nom"] = horse.name;
        if (visibleColumns.horseId) data["Id"] = horse.horseId;
        if (visibleColumns.matricule)
          data["Matricule"] = horse.matricule || "-------";
        if (visibleColumns.pere)
          data["Père"] = horse.father?.name || horse.fatherText || "-------";
        if (visibleColumns.mere)
          data["Mère"] = horse.mother?.name || horse.motherText || "-------";
        if (visibleColumns.race) data["Race"] = horse.race;
        if (visibleColumns.robe) data["Robe"] = horse.robe;
        if (visibleColumns.taille) data["Taille"] = horse.Taille || "-------";
        if (visibleColumns.puce) data["Puce"] = horse.Puce || "-------";
        if (visibleColumns.provenance)
          data["Provenance"] = horse.Provenance || "-------";
        if (visibleColumns.detachement)
          data["Detachement"] = horse.Detachement || "-------";
        if (visibleColumns.age)
          data["Âge"] = `${calculateAge(horse.birthDate)} ans`;
        if (visibleColumns.sex) data["Sexe"] = horse.sex;
        if (visibleColumns.discipline) data["Discipline"] = horse.discipline;
        if (visibleColumns.etat) data["État"] = horse.etat;

        return data;
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = URL.createObjectURL(blob);
      link.download = `chevaux_${date}.csv`;
      link.click();
    } catch (err) {
      console.error("Error exporting data:", err);
      setError("Erreur lors de l'exportation");
    }
  };

  const generatePDF = async (customTitle) => {
    try {
      if (horses.length === 0) {
        setError("Aucune donnée à exporter");
        return;
      }

      const doc = new jsPDF("landscape");
      const date = new Date().toLocaleDateString("fr-FR");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Build columns based on visibility settings
      let columns = [];

      if (visibleColumns.horseId)
        columns.push({ header: "Id", dataKey: "horseId" });
      if (visibleColumns.name) columns.push({ header: "Nom", dataKey: "name" });
      if (visibleColumns.pere)
        columns.push({ header: "Père", dataKey: "pere" });
      if (visibleColumns.mere)
        columns.push({ header: "Mère", dataKey: "mere" });
      if (visibleColumns.matricule)
        columns.push({ header: "Matricule", dataKey: "matricule" });
      if (visibleColumns.taille)
        columns.push({ header: "Taille", dataKey: "taille" });
      if (visibleColumns.puce)
        columns.push({ header: "Puce", dataKey: "puce" });
      if (visibleColumns.provenance)
        columns.push({ header: "Provenance", dataKey: "provenance" });
      if (visibleColumns.detachement)
        columns.push({ header: "Detachement", dataKey: "detachement" });
      if (visibleColumns.race)
        columns.push({ header: "Race", dataKey: "race" });
      if (visibleColumns.robe)
        columns.push({ header: "Robe", dataKey: "robe" });
      if (visibleColumns.age) columns.push({ header: "Âge", dataKey: "age" });
      if (visibleColumns.sex) columns.push({ header: "Sexe", dataKey: "sex" });
      if (visibleColumns.discipline)
        columns.push({ header: "Position", dataKey: "discipline" });
      if (visibleColumns.etat)
        columns.push({ header: "État", dataKey: "etat" });
      if (visibleColumns.updatedAt)
        columns.push({ header: "Mise à jour", dataKey: "updatedAt" });

      const tableData = horses.map((horse) => ({
        horseId: horse.horseId || "",
        name: horse.name || "",
        pere: horse?.father?.name || horse?.fatherText || "",
        mere: horse?.mother?.name || horse?.motherText || "",
        matricule: horse.matricule || "-------",
        taille: horse.Taille || "-------",
        puce: horse.Puce || "-------",
        provenance: horse.Provenance || "-------",
        detachement: horse.Detachement || "-------",
        race: horse.race || "",
        robe: horse.robe || "",
        age: `${calculateAge(horse.birthDate)} ans`,
        sex: horse.sex || "",
        discipline: horse.discipline || "",
        etat: horse.etat || "",
        updatedAt: horse.updatedAt?.replace("T", " ").substring(0, 16) || "",
      }));

      // Set font size for title
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
      doc.text(``, 14, 30);

      let yPosition = 38;
      const activeFilters = Object.entries(filters).filter(
        ([_, value]) => value
      );
      if (activeFilters.length > 0) {
        doc.setFontSize(10);
        doc.text("Filtres appliqués:", 14, yPosition);
        yPosition += 6;

        activeFilters.forEach(([key, value]) => {
          doc.text(`- ${key}: ${value}`, 20, yPosition);
          yPosition += 5;
        });

        yPosition += 5;
      }

      doc.autoTable({
        startY: yPosition,
        head: [columns.map((col) => col.header)],
        body: tableData.map((row) => columns.map((col) => row[col.dataKey])),
        didDrawPage: (data) => {
          // Header
          const pageNumber = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);

          // Add page numbers at the bottom
          doc.text(
            ``,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            ``,
            doc.internal.pageSize.width - 60,
            doc.internal.pageSize.height - 10
          );
        },
        margin: { top: 45 },
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: {
          fillColor: [27, 77, 62],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
          etat: {
            cellCallback: function (cell, data) {
              if (data.raw === "sain") {
                cell.styles.textColor = [0, 128, 0];
              } else if (data.raw === "malade") {
                cell.styles.textColor = [192, 0, 0];
              } else if (data.raw === "en rétablissement") {
                cell.styles.textColor = [184, 134, 11];
              }
            },
          },
        },
      });

      doc.save(`chevaux_${date.replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Erreur lors de l'exportation en PDF");
    }
  };

  const generateWord = async (customTitle) => {
    try {
      if (horses.length === 0) {
        setError("Aucune donnée à exporter");
        return;
      }

      // Create header rows with the selected columns
      const headerRow = new TableRow({
        children: Object.entries(columns)
          .filter(([key]) => visibleColumns[key])
          .map(
            ([_, label]) =>
              new TableCell({
                children: [new Paragraph(label)],
                shading: {
                  fill: "1B4D3E",
                  color: "1B4D3E",
                },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "FFFFFF",
                  },
                  left: { style: BorderStyle.SINGLE, size: 1, color: "FFFFFF" },
                  right: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "FFFFFF",
                  },
                },
              })
          ),
      });

      // Create data rows for each horse
      const tableRows = horses.map((horse) => {
        const cells = [];

        if (visibleColumns.horseId)
          cells.push(
            new TableCell({ children: [new Paragraph(horse.horseId || "")] })
          );
        if (visibleColumns.name)
          cells.push(
            new TableCell({ children: [new Paragraph(horse.name || "")] })
          );
        if (visibleColumns.pere)
          cells.push(
            new TableCell({
              children: [
                new Paragraph(horse?.father?.name || horse?.fatherText || ""),
              ],
            })
          );
        if (visibleColumns.mere)
          cells.push(
            new TableCell({
              children: [
                new Paragraph(horse?.mother?.name || horse?.motherText || ""),
              ],
            })
          );
        if (visibleColumns.matricule)
          cells.push(
            new TableCell({
              children: [new Paragraph(horse.matricule || "-------")],
            })
          );
        if (visibleColumns.taille)
          cells.push(
            new TableCell({
              children: [new Paragraph(horse.Taille || "-------")],
            })
          );
        if (visibleColumns.puce)
          cells.push(
            new TableCell({
              children: [new Paragraph(horse.Puce || "-------")],
            })
          );
        if (visibleColumns.provenance)
          cells.push(
            new TableCell({
              children: [new Paragraph(horse.Provenance || "-------")],
            })
          );
        if (visibleColumns.detachement)
          cells.push(
            new TableCell({
              children: [new Paragraph(horse.Detachement || "-------")],
            })
          );
        if (visibleColumns.race)
          cells.push(
            new TableCell({ children: [new Paragraph(horse.race || "")] })
          );
        if (visibleColumns.robe)
          cells.push(
            new TableCell({ children: [new Paragraph(horse.robe || "")] })
          );
        if (visibleColumns.age)
          cells.push(
            new TableCell({
              children: [new Paragraph(`${calculateAge(horse.birthDate)} ans`)],
            })
          );
        if (visibleColumns.sex)
          cells.push(
            new TableCell({ children: [new Paragraph(horse.sex || "")] })
          );
        if (visibleColumns.discipline)
          cells.push(
            new TableCell({ children: [new Paragraph(horse.discipline || "")] })
          );
        if (visibleColumns.etat) {
          const etatCell = new TableCell({
            children: [new Paragraph(horse.etat || "")],
          });
          cells.push(etatCell);
        }
        if (visibleColumns.updatedAt)
          cells.push(
            new TableCell({
              children: [
                new Paragraph(
                  horse.updatedAt?.replace("T", " ").substring(0, 16) || ""
                ),
              ],
            })
          );

        return new TableRow({ children: cells });
      });

      // Create table with all rows
      const table = new Table({
        rows: [headerRow, ...tableRows],
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });

      // Create title and date
      const date = new Date().toLocaleDateString("fr-FR");
      const title = new Paragraph({
        text: customTitle,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 200,
        },
      });

      const subtitle = new Paragraph({
        text: ``,
        alignment: AlignmentType.RIGHT,
        spacing: {
          after: 400,
        },
      });

      // Create filter section if filters are applied
      const filterParagraphs = [];
      const activeFilters = Object.entries(filters).filter(
        ([_, value]) => value
      );

      if (activeFilters.length > 0) {
        filterParagraphs.push(
          new Paragraph({
            text: "Filtres appliqués:",
            alignment: AlignmentType.LEFT,
            spacing: {
              after: 200,
            },
          })
        );

        activeFilters.forEach(([key, value]) => {
          filterParagraphs.push(
            new Paragraph({
              text: `- ${key}: ${value}`,
              alignment: AlignmentType.LEFT,
              indent: {
                left: 360, // ~0.5cm indent
              },
            })
          );
        });

        // Add spacing after filters
        filterParagraphs.push(
          new Paragraph({
            text: "",
            spacing: {
              after: 200,
            },
          })
        );
      }

      // Create the document with all elements
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
            children: [title, subtitle, ...filterParagraphs, table],
          },
        ],
      });

      // Generate the document as a blob and save it
      const buffer = await Packer.toBlob(doc);
      const fileName = `chevaux_${date.replace(/\//g, "-")}.docx`;
      saveAs(buffer, fileName);
    } catch (err) {
      console.error("Error exporting Word:", err);
      setError("Erreur lors de l'exportation en Word");
    }
  };

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

  const handleUpdateClick = (horseId) => {
    router.push(`/options/horses/horse?h=${horseId}`);
  };

  const handleUpdateHorse = (horseId) => {
    router.push(`/options/updatehorse?h=${horseId}`);
  };

  const handleDelete = async (horseId) => {
    const BASE_URL = "http://localhost:3001/api";
    try {
      const response = await fetch(`${BASE_URL}/horse/${horseId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Une erreur est survenue lors de la suppression"
        );
      }
      router.replace("/options/horses", { shallow: true });
      fetchHorses();
    } catch (error) {
      console.error("Error deleting horse:", error);
    }
  };

  const handleMedical = (horseId) => {
    const selectedHorse = horses.find((horse) => horse._id === horseId);
    if (selectedHorse) {
      router.push(
        `/options/choix?selectedHorse=${encodeURIComponent(
          JSON.stringify(selectedHorse)
        )}`
      );
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      race: "",
      robe: "",
      etat: "",
      discipline: "",
      ageRange: "",
      pere: "",
      mere: "",
      taille: "",
      provenance: "",
      detachement: "",
    });
    router.push("/options/horses");
  };

  // Create options for select dropdowns
  const raceOptions = getSelectOptions(
    Array.from(new Set(horses.map((horse) => horse.race)))
      .filter(Boolean)
      .sort()
  );
  const robeOptions = getSelectOptions(
    Array.from(new Set(horses.map((horse) => horse.robe)))
      .filter(Boolean)
      .sort()
  );
  const disciplineOptions = getSelectOptions(
    Array.from(new Set(horses.map((horse) => horse.discipline)))
      .filter(Boolean)
      .sort()
  );
  const pereOptions = getSelectOptions(
    Array.from(
      new Set(horses.map((horse) => horse.father?.name || horse.fatherText))
    )
      .filter(Boolean)
      .sort()
  );
  const mereOptions = getSelectOptions(
    Array.from(
      new Set(horses.map((horse) => horse.mother?.name || horse.motherText))
    )
      .filter(Boolean)
      .sort()
  );
  const tailleOptions = getSelectOptions(
    Array.from(new Set(horses.map((horse) => horse.Taille)))
      .filter(Boolean)
      .sort()
  );
  const provenanceOptions = getSelectOptions(
    Array.from(new Set(horses.map((horse) => horse.Provenance)))
      .filter(Boolean)
      .sort()
  );
  const detachementOptions = getSelectOptions(
    Array.from(new Set(horses.map((horse) => horse.Detachement)))
      .filter(Boolean)
      .sort()
  );

  // Render UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsChange={handleParamsChange} />
      </Suspense>

      <div className="mx-10 px-6 py-12">
        {/* Header Section */}
        <div className="mb-10 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <div className="flex justify-between items-center mt-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B4D3E]">
                Liste des Chevaux
              </h1>
              <p className="text-gray-600 mt-2">
                Gestion du registre équin • {horses.length} chevaux affichés
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setShowColumnSelector(true)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Colonnes
              </button>
              <Link
                href="/options/newhorse"
                className="px-4 py-2 rounded-xl bg-[#1B4D3E] text-white hover:bg-[#153729] transition-colors flex items-center gap-2"
              >
                + Nouveau Cheval
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  disabled={horses.length === 0}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                    horses.length === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={horses.length === 0}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                    horses.length === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                  }`}
                >
                  <FileIcon className="w-4 h-4" />
                  Exporter PDF
                </button>
                <button
                  onClick={handleExportWord}
                  disabled={horses.length === 0}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                    horses.length === 0
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
        </div>

        {/* Error Display */}
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
        {Object.values(filters).some((filter) => filter !== "") && (
          <div className="mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Filtres actifs:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2"
                >
                  {`${key}: ${value}`}
                  <button
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, [key]: "" }))
                    }
                    className="hover:text-red-200"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <button
              onClick={clearFilters}
              className="text-sm text-[#1B4D3E] hover:text-[#153729] underline"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 mb-8">
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
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recherche
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nom ou matricule..."
                    className="w-full pl-12 pr-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* État Select - now searchable */}
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
                  value={filters.etat}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, etat: e.target.value }))
                  }
                  placeholder="Rechercher un état..."
                  emptyOptionLabel="Tous les états"
                />
              </div>

              {/* Race Select - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Race
                </label>
                <SearchableSelect
                  options={raceOptions}
                  value={filters.race}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, race: e.target.value }))
                  }
                  placeholder="Rechercher une race..."
                  emptyOptionLabel="Toutes les races"
                />
              </div>

              {/* Robe Select - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robe
                </label>
                <SearchableSelect
                  options={robeOptions}
                  value={filters.robe}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, robe: e.target.value }))
                  }
                  placeholder="Rechercher une robe..."
                  emptyOptionLabel="Toutes les robes"
                />
              </div>

              {/* Discipline Select - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <SearchableSelect
                  options={disciplineOptions}
                  value={filters.discipline}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      discipline: e.target.value,
                    }))
                  }
                  placeholder="Rechercher une position..."
                  emptyOptionLabel="Toutes les positions"
                />
              </div>

              {/* Age Range Select - now searchable */}
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
                  value={filters.ageRange}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: e.target.value,
                    }))
                  }
                  placeholder="Rechercher une tranche d'âge..."
                  emptyOptionLabel="Tous les âges"
                />
              </div>

              {/* Père Filter - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Père
                </label>
                <SearchableSelect
                  options={pereOptions}
                  value={filters.pere}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, pere: e.target.value }))
                  }
                  placeholder="Rechercher un père..."
                  emptyOptionLabel="Tous les pères"
                />
              </div>

              {/* Mère Filter - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mère
                </label>
                <SearchableSelect
                  options={mereOptions}
                  value={filters.mere}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, mere: e.target.value }))
                  }
                  placeholder="Rechercher une mère..."
                  emptyOptionLabel="Toutes les mères"
                />
              </div>

              {/* Taille Filter - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <SearchableSelect
                  options={tailleOptions}
                  value={filters.taille}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, taille: e.target.value }))
                  }
                  placeholder="Rechercher une taille..."
                  emptyOptionLabel="Toutes les tailles"
                />
              </div>

              {/* Provenance Filter - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provenance
                </label>
                <SearchableSelect
                  options={provenanceOptions}
                  value={filters.provenance}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      provenance: e.target.value,
                    }))
                  }
                  placeholder="Rechercher une provenance..."
                  emptyOptionLabel="Toutes les provenances"
                />
              </div>

              {/* Detachement Filter - now searchable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detachement
                </label>
                <SearchableSelect
                  options={detachementOptions}
                  value={filters.detachement}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      detachement: e.target.value,
                    }))
                  }
                  placeholder="Rechercher un detachement..."
                  emptyOptionLabel="Tous les detachements"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Table - with sortable columns */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B4D3E] mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des données...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {visibleColumns.horseId && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("horseId")}
                      >
                        <div className="flex items-center justify-between">
                          Id
                          {sortConfig.key === "horseId" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center justify-between">
                          Nom
                          {sortConfig.key === "name" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.pere && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("pere")}
                      >
                        <div className="flex items-center justify-between">
                          Père
                          {sortConfig.key === "pere" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.mere && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("mere")}
                      >
                        <div className="flex items-center justify-between">
                          Mère
                          {sortConfig.key === "mere" &&
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
                        <div className="flex items-center justify-between">
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
                    {visibleColumns.taille && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("taille")}
                      >
                        <div className="flex items-center justify-between">
                          Taille
                          {sortConfig.key === "taille" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.puce && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("puce")}
                      >
                        <div className="flex items-center justify-between">
                          Puce
                          {sortConfig.key === "puce" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.provenance && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("provenance")}
                      >
                        <div className="flex items-center justify-between">
                          Provenance
                          {sortConfig.key === "provenance" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.detachement && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("detachement")}
                      >
                        <div className="flex items-center justify-between">
                          Detachement
                          {sortConfig.key === "detachement" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.race && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("race")}
                      >
                        <div className="flex items-center justify-between">
                          Race
                          {sortConfig.key === "race" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.robe && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("robe")}
                      >
                        <div className="flex items-center justify-between">
                          Robe
                          {sortConfig.key === "robe" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.etat && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("etat")}
                      >
                        <div className="flex items-center justify-between">
                          État
                          {sortConfig.key === "etat" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.age && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("age")}
                      >
                        <div className="flex items-center justify-between">
                          Âge
                          {sortConfig.key === "age" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.sex && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("sex")}
                      >
                        <div className="flex items-center justify-between">
                          Sexe
                          {sortConfig.key === "sex" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    {visibleColumns.discipline && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("discipline")}
                      >
                        <div className="flex items-center justify-between">
                          Position
                          {sortConfig.key === "discipline" &&
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
                        <div className="flex items-center justify-between">
                          Mise à jour
                          {sortConfig.key === "updatedAt" &&
                            (sortConfig.direction === "asc" ? (
                              <ArrowUp className="w-4 h-4" />
                            ) : (
                              <ArrowDown className="w-4 h-4" />
                            ))}
                        </div>
                      </th>
                    )}
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedHorses.length > 0 ? (
                    sortedHorses.map((horse) => (
                      <tr
                        key={horse._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {visibleColumns.horseId && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.horseId}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.name}
                          </td>
                        )}
                        {visibleColumns.pere && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.father?.name ??
                              horse.fatherText ??
                              "-------"}
                          </td>
                        )}
                        {visibleColumns.mere && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.mother?.name ??
                              horse.motherText ??
                              "-------"}
                          </td>
                        )}
                        {visibleColumns.matricule && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.matricule ?? "-------"}
                          </td>
                        )}
                        {visibleColumns.taille && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.Taille ?? "-------"}
                          </td>
                        )}
                        {visibleColumns.puce && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.Puce ?? "-------"}
                          </td>
                        )}
                        {visibleColumns.provenance && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.Provenance ?? "-------"}
                          </td>
                        )}
                        {visibleColumns.detachement && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.Detachement ?? "-------"}
                          </td>
                        )}
                        {visibleColumns.race && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.race}
                          </td>
                        )}
                        {visibleColumns.robe && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.robe}
                          </td>
                        )}
                        {visibleColumns.etat && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm cursor-pointer"
                          >
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                horse.etat === "sain"
                                  ? "bg-green-100 text-green-800"
                                  : horse.etat === "malade"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {horse.etat}
                            </span>
                          </td>
                        )}
                        {visibleColumns.age && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {calculateAge(horse.birthDate)} ans
                          </td>
                        )}
                        {visibleColumns.sex && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.sex}
                          </td>
                        )}
                        {visibleColumns.discipline && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.discipline}
                          </td>
                        )}
                        {visibleColumns.updatedAt && (
                          <td
                            onClick={() => handleUpdateClick(horse._id)}
                            className="px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          >
                            {horse.updatedAt
                              ?.replace("T", " ")
                              .substring(0, 16)}
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-center">
                          <div className="flex items-center justify-evenly">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMedical(horse._id);
                              }}
                              className="hover:text-blue-600 text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50"
                              title="Consultation"
                            >
                              <BriefcaseMedicalIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateHorse(horse._id);
                              }}
                              className="hover:text-green-600 text-green-500 transition-colors p-1 rounded-full hover:bg-green-50"
                              title="Modifier"
                            >
                              <PenIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(horse._id);
                              }}
                              className="hover:text-red-600 text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                              title="Supprimer"
                            >
                              <XIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          Object.values(visibleColumns).filter(Boolean).length +
                          1
                        }
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        {Object.values(filters).some((filter) => filter) ? (
                          <div className="flex flex-col items-center">
                            <p className="mb-2">
                              Aucun cheval trouvé pour les critères sélectionnés
                            </p>
                            <button
                              onClick={clearFilters}
                              className="text-[#1B4D3E] hover:text-[#153729] underline text-sm"
                            >
                              Effacer les filtres
                            </button>
                          </div>
                        ) : (
                          "Aucun cheval disponible"
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
