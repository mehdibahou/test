"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Pill,
  Leaf,
  Scissors,
  Clock,
  Plus,
  Calendar,
  AlertTriangle,
  ChevronDown,
  X,
  SlidersHorizontal,
  Download,
  FileText,
  ChevronRight,
  Check,
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Format date - helper function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
};

// PDF Export Modal Component
function PDFExportModal({
  isOpen,
  onClose,
  onExport,
  prophylaxies,
  defaultTitle = "Liste des Prophylaxies",
}) {
  const [documentTitle, setDocumentTitle] = useState(defaultTitle);
  const [selectedColumns, setSelectedColumns] = useState({
    cheval: true,
    type: true,
    date: true,
    rappel: true,
    details: true,
    notes: true,
  });

  if (!isOpen) return null;

  const handleColumnToggle = (columnName) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  const handleExport = () => {
    onExport({
      title: documentTitle,
      columns: selectedColumns,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-[#1B4D3E]" />
            Configuration de l'export PDF
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Document Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre du document
            </label>
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 
                       focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                       outline-none transition-all"
              placeholder="Entrez un titre pour le document PDF"
            />
          </div>

          {/* Column Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Colonnes à inclure
            </label>
            <div className="space-y-3">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() =>
                    setSelectedColumns({
                      cheval: true,
                      type: true,
                      date: true,
                      rappel: true,
                      details: true,
                      notes: true,
                    })
                  }
                  className="text-sm text-[#1B4D3E] hover:underline"
                >
                  Tout sélectionner
                </button>
              </div>

              <ColumnCheckbox
                id="cheval"
                label="Cheval"
                checked={selectedColumns.cheval}
                onChange={() => handleColumnToggle("cheval")}
              />

              <ColumnCheckbox
                id="type"
                label="Type de prophylaxie"
                checked={selectedColumns.type}
                onChange={() => handleColumnToggle("type")}
              />

              <ColumnCheckbox
                id="date"
                label="Date de réalisation"
                checked={selectedColumns.date}
                onChange={() => handleColumnToggle("date")}
              />

              <ColumnCheckbox
                id="rappel"
                label="Date de rappel"
                checked={selectedColumns.rappel}
                onChange={() => handleColumnToggle("rappel")}
              />

              <ColumnCheckbox
                id="details"
                label="Détails spécifiques"
                checked={selectedColumns.details}
                onChange={() => handleColumnToggle("details")}
              />

              <ColumnCheckbox
                id="notes"
                label="Notes"
                checked={selectedColumns.notes}
                onChange={() => handleColumnToggle("notes")}
              />
            </div>
          </div>

          <div className="bg-gray-50/50 rounded-lg p-3 text-sm text-gray-600">
            <p>
              Le document sera généré avec{" "}
              {Object.values(selectedColumns).filter(Boolean).length} colonnes
              et contiendra {prophylaxies?.length || 0} entrées.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#1B4D3E] text-white rounded-lg hover:bg-[#2A9D8F] transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Générer le PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper component for column checkboxes
function ColumnCheckbox({ id, label, checked, onChange }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
        ${
          checked
            ? "bg-[#1B4D3E]/10 border border-[#1B4D3E]/30"
            : "bg-white border border-gray-200 hover:border-gray-300"
        }`}
    >
      <div
        className={`w-5 h-5 rounded-md border flex items-center justify-center
          ${checked ? "bg-[#1B4D3E] border-[#1B4D3E]" : "border-gray-300"}`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" />}
      </div>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4D3E]"></div>
    </div>
  );
}

// Empty state component
function EmptyState({ message, onAddNew }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 text-center py-16">
      <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
        <Calendar className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Aucune prophylaxie trouvée
      </h3>
      <p className="text-gray-500 mb-6">{message}</p>
      <button
        onClick={onAddNew}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1B4D3E] hover:bg-[#2A9D8F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4D3E]"
      >
        <Plus className="h-5 w-5 mr-2" />
        Ajouter une prophylaxie
      </button>
    </div>
  );
}

// FilterGroup component for better organization
function FilterGroup({ title, children, isOpen, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-[#1B4D3E]">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ${
          isOpen ? "max-h-96 p-3" : "max-h-0 p-0"
        } overflow-hidden`}
      >
        {children}
      </div>
    </div>
  );
}

// Applied filter tag component
function FilterTag({ label, onRemove }) {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#1B4D3E]/10 text-[#1B4D3E] mr-2 mb-2">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="ml-1.5 p-0.5 rounded-full hover:bg-[#1B4D3E]/20"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// Dropdown select component
function SelectFilter({ label, value, options, onChange }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                outline-none transition-all bg-white/50"
      >
        <option value="">Tous</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Detailed prophylaxie information component (expandable)
function ProphylaxieDetails({ item, isExpanded, onToggle }) {
  const getDetailsByType = () => {
    switch (item.type) {
      case "Vaccination":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <span className="font-medium text-[#1B4D3E]">Vaccin:</span>
              <span className="ml-2">
                {item.details?.nomVaccin || "Non spécifié"}
              </span>
            </div>
            <div>
              <span className="font-medium text-[#1B4D3E]">Maladie:</span>
              <span className="ml-2">
                {item.details?.maladie === "Autres"
                  ? item.details?.maladieAutre || "Autre maladie (non précisée)"
                  : item.details?.maladie || "Non spécifiée"}
              </span>
            </div>
          </div>
        );
      case "Vermifugation":
        return (
          <div className="mt-3">
            <span className="font-medium text-[#1B4D3E]">Produit:</span>
            <span className="ml-2">
              {item.details?.nomProduit || "Non spécifié"}
            </span>
          </div>
        );
      case "Soins dentaires":
        return (
          <div className="mt-3">
            <span className="font-medium text-[#1B4D3E]">
              Type d'intervention:
            </span>
            <span className="ml-2">
              {item.details?.typeIntervention || "Non spécifié"}
            </span>
          </div>
        );
      case "Autre":
        return (
          <div className="mt-3 space-y-2">
            <div>
              <span className="font-medium text-[#1B4D3E]">Type:</span>
              <span className="ml-2">
                {item.details?.typeAutre || "Non spécifié"}
              </span>
            </div>
            {item.details?.descriptionAutre && (
              <div>
                <span className="font-medium text-[#1B4D3E]">Description:</span>
                <div className="mt-1 ml-2 text-sm text-gray-600 border-l-2 border-gray-200 pl-2">
                  {item.details.descriptionAutre}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div className="mt-3">Pas de détails supplémentaires</div>;
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={onToggle}
        className="flex items-center text-sm text-[#1B4D3E] hover:text-[#2A9D8F] transition-colors font-medium"
      >
        {isExpanded ? "Masquer les détails" : "Afficher les détails"}
        <ChevronDown
          className={`ml-1 w-4 h-4 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-2 p-3 bg-white/80 rounded-xl border border-gray-100">
          {getDetailsByType()}

          {item.notes && (
            <div className="mt-3">
              <span className="font-medium text-[#1B4D3E]">Notes:</span>
              <div className="mt-1 text-sm text-gray-600 border-l-2 border-gray-200 pl-2">
                {item.notes}
              </div>
            </div>
          )}

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <span className="font-medium text-[#1B4D3E]">Créé le:</span>
              <span className="ml-2">{formatDate(item.createdAt)}</span>
            </div>
            <div>
              <span className="font-medium text-[#1B4D3E]">
                Dernière modification:
              </span>
              <span className="ml-2">{formatDate(item.updatedAt)}</span>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}

// Custom export dropdown menu component
function ExportMenu({ onExportPDF, onExportWord, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Download className="w-4 h-4" />
        Exporter
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 py-1 border border-gray-200">
          <button
            onClick={() => {
              onExportPDF();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-[#1B4D3E]" />
            <span>Exporter en PDF</span>
          </button>
          <button
            onClick={() => {
              onExportWord();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Exporter en Word</span>
          </button>
        </div>
      )}
    </div>
  );
}

// PDF Generation function
function generateProphylaxiePDF(prophylaxies, exportOptions, activeFilters) {
  try {
    const { title, columns } = exportOptions;

    // Create PDF document
    const doc = new jsPDF({ orientation: "landscape" });

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(27, 77, 62); // #1B4D3E
    doc.text(title || "Liste des Prophylaxies", 14, 22);

    // Add generation date (only at the top, not in the table)
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    // doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 30);

    // Build table columns based on selection
    const tableColumns = [];

    // Add selected columns
    if (columns.cheval)
      tableColumns.push({ header: "Cheval", dataKey: "horse" });
    if (columns.type) tableColumns.push({ header: "Type", dataKey: "type" });
    if (columns.date) tableColumns.push({ header: "Date", dataKey: "date" });
    if (columns.rappel)
      tableColumns.push({ header: "Rappel", dataKey: "rappel" });
    if (columns.details)
      tableColumns.push({ header: "Détails", dataKey: "details" });
    if (columns.notes) tableColumns.push({ header: "Notes", dataKey: "notes" });

    // Add filter information if any filters are active
    let startY = 38;
    if (Object.keys(activeFilters).length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text("Filtres appliqués:", 14, startY);

      let filterText = "";
      Object.entries(activeFilters).forEach(([key, value]) => {
        filterText += `${getFilterLabel(key, value)}; `;
      });

      // Wrap and print filter text
      const splitFilterText = doc.splitTextToSize(filterText, 270);
      doc.text(splitFilterText, 14, startY + 6);

      startY += splitFilterText.length * 6 + 8;
    }

    // Build table data rows
    const tableRows = prophylaxies.map((item) => {
      const row = {};

      if (columns.cheval) {
        row.horse = item.horse?.name || "N/A";
        if (item.horse?.matricule) row.horse += ` (${item.horse.matricule})`;
      }

      if (columns.type) row.type = item.type || "N/A";
      if (columns.date) row.date = formatDate(item.date);
      if (columns.rappel) row.rappel = formatDate(item.dateRappel);
      if (columns.details) row.details = getDetailsBasedOnType(item);
      if (columns.notes) row.notes = item.notes || "N/A";

      return row;
    });

    // Create column headers for autoTable
    const headers = tableColumns.map((col) => col.header);

    // Map data to format expected by autoTable
    const data = tableRows.map((row) =>
      tableColumns.map((col) => row[col.dataKey])
    );

    // Add the table
    doc.autoTable({
      startY: startY,
      head: [headers],
      body: data,
      headStyles: {
        fillColor: [27, 77, 62],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [242, 242, 242],
      },
      styles: {
        overflow: "linebreak",
        cellPadding: 3,
      },
    });

    // Create safe filename
    const safeTitle = title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .substring(0, 50);
    const fileName = `${safeTitle}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // Save the PDF to user's device
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

// Helper function to get details based on prophylaxie type
function getDetailsBasedOnType(item) {
  switch (item.type) {
    case "Vaccination":
      return `Vaccin: ${item.details?.nomVaccin || "N/A"}\nMaladie: ${
        item.details?.maladie === "Autres"
          ? item.details?.maladieAutre || "Autre"
          : item.details?.maladie || "N/A"
      }`;
    case "Vermifugation":
      return `Produit: ${item.details?.nomProduit || "N/A"}`;
    case "Soins dentaires":
      return `Intervention: ${item.details?.typeIntervention || "N/A"}`;
    case "Autre":
      return `Type: ${item.details?.typeAutre || "N/A"}${
        item.details?.descriptionAutre
          ? `\nDescription: ${item.details.descriptionAutre}`
          : ""
      }`;
    default:
      return "N/A";
  }
}

// Helper function for filter labels
function getFilterLabel(name, value) {
  switch (name) {
    case "type":
      return `Type: ${value}`;
    case "dateStart":
      return `Du: ${formatDate(value)}`;
    case "dateEnd":
      return `Au: ${formatDate(value)}`;
    case "reminderStart":
      return `Rappel du: ${formatDate(value)}`;
    case "reminderEnd":
      return `Rappel au: ${formatDate(value)}`;
    case "reminderStatus":
      return `Statut: ${
        value === "upcoming"
          ? "À venir"
          : value === "overdue"
          ? "En retard"
          : value
      }`;
    case "vaccin":
      return `Vaccin: ${value}`;
    case "maladie":
      return `Maladie: ${value}`;
    case "nomProduit":
      return `Produit: ${value}`;
    case "typeIntervention":
      return `Intervention: ${value}`;
    case "typeAutre":
      return `Type personnalisé: ${value}`;
    case "race":
      return `Race: ${value}`;
    case "discipline":
      return `Discipline: ${value}`;
    case "etat":
      return `État: ${value}`;
    case "robe":
      return `Robe: ${value}`;
    case "ageRange":
      return `Âge: ${value}`;
    case "pere":
      return `Père: ${value}`;
    case "mere":
      return `Mère: ${value}`;
    case "taille":
      return `Taille: ${value}`;
    case "puce":
      return `Puce: ${value}`;
    case "provenance":
      return `Provenance: ${value}`;
    case "detachement":
      return `Détachement: ${value}`;
    default:
      return `${name}: ${value}`;
  }
}

// Main Prophylaxie List Component
export default function ProphylaxieList() {
  const router = useRouter();
  const [prophylaxies, setProphylaxies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  // State for PDF export modal
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State for expanded filter sections
  const [expandedFilterSections, setExpandedFilterSections] = useState({
    prophylaxie: true,
    horse: false,
    vaccine: false,
    vermifugation: false,
    soins: false,
    autre: false,
  });

  // Default filter options to use as fallbacks
  const defaultFilterOptions = {
    vaccines: [],
    maladies: [
      { value: "Grippe équine", label: "Grippe équine" },
      { value: "Rhinopneumonie", label: "Rhinopneumonie" },
      { value: "Tétanos", label: "Tétanos" },
      { value: "Autres", label: "Autres" },
    ],
    produits: [],
    interventions: [],
    typesAutres: [],
    races: [],
    disciplines: [],
    etats: [],
    robes: [],
    tailles: [],
    provenances: [],
    detachements: [],
    ageRanges: [
      { value: "0-4", label: "0-4 ans" },
      { value: "5-7", label: "5-7 ans" },
      { value: "8-12", label: "8-12 ans" },
      { value: "13-15", label: "13-15 ans" },
      { value: "16-18", label: "16-18 ans" },
      { value: "18-20", label: "18-20 ans" },
      { value: ">20", label: "Plus de 20 ans" },
    ],
  };

  // Initialize filter options state with defaults
  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    // Prophylaxie specific filters
    type: "",
    dateStart: "",
    dateEnd: "",
    reminderStart: "",
    reminderEnd: "",
    reminderStatus: "", // "upcoming", "overdue", "all"

    // Vaccination specific filters
    vaccin: "",
    maladie: "",

    // Vermifugation specific filter
    nomProduit: "",

    // Soins dentaires specific filter
    typeIntervention: "",

    // Autre specific filter
    typeAutre: "",

    // Horse specific filters
    etat: "",
    race: "",
    robe: "",
    discipline: "",
    ageRange: "",
    pere: "",
    mere: "",
    taille: "",
    puce: "",
    provenance: "",
    detachement: "",
  });

  const [sortBy, setSortBy] = useState("date-desc");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Extract filter options from prophylaxie data - Key function for dynamic filters
  useEffect(() => {
    if (prophylaxies && prophylaxies.length > 0) {
      // Helper function to extract unique values and convert to option format
      const extractOptions = (getValueFn) => {
        return [
          ...new Set(
            prophylaxies.map(getValueFn).filter(Boolean) // Remove null/undefined values
          ),
        ].map((value) => ({ value, label: value }));
      };

      // Extract all filter options from the prophylaxie data
      const extractedOptions = {
        // Prophylaxie-specific filters
        vaccines: extractOptions((item) =>
          item.type === "Vaccination" ? item.details?.nomVaccin : null
        ),

        produits: extractOptions((item) =>
          item.type === "Vermifugation" ? item.details?.nomProduit : null
        ),

        interventions: extractOptions((item) =>
          item.type === "Soins dentaires"
            ? item.details?.typeIntervention
            : null
        ),

        typesAutres: extractOptions((item) =>
          item.type === "Autre" ? item.details?.typeAutre : null
        ),

        // Extract standard diseases
        standardMaladies: extractOptions((item) =>
          item.type === "Vaccination" && item.details?.maladie !== "Autres"
            ? item.details?.maladie
            : null
        ),

        // Extract custom diseases from "Autres" category
        customMaladies: extractOptions((item) =>
          item.type === "Vaccination" && item.details?.maladie === "Autres"
            ? item.details?.maladieAutre
            : null
        ),

        // Horse-related filters
        races: extractOptions((item) => item.horse?.race),
        disciplines: extractOptions((item) => item.horse?.discipline),
        etats: extractOptions((item) => item.horse?.etat),
        robes: extractOptions((item) => item.horse?.robe),
        tailles: extractOptions((item) => item.horse?.taille),
        provenances: extractOptions((item) => item.horse?.provenance),
        detachements: extractOptions((item) => item.horse?.detachement),
      };

      // Ensure we maintain any default options as fallbacks
      const newOptions = { ...defaultFilterOptions };

      // Process each option category
      Object.keys(extractedOptions).forEach((key) => {
        if (key !== "standardMaladies" && key !== "customMaladies") {
          // If we extracted options, use them
          if (extractedOptions[key] && extractedOptions[key].length > 0) {
            newOptions[key] = extractedOptions[key];
          }
        }
      });

      // Special handling for maladies to combine standard and custom
      const standardMaladies = extractedOptions.standardMaladies || [];
      const customMaladies = extractedOptions.customMaladies || [];

      // For maladies, we want to include both default and extracted values,
      // ensuring we have standard options plus any custom ones
      if (standardMaladies.length > 0 || customMaladies.length > 0) {
        // Start with default maladies to ensure we always have the standard options
        const allMaladies = [...defaultFilterOptions.maladies];

        // Add any extracted standard options not already included
        standardMaladies.forEach((option) => {
          if (!allMaladies.some((m) => m.value === option.value)) {
            allMaladies.push(option);
          }
        });

        // Add any custom disease options
        customMaladies.forEach((option) => {
          if (!allMaladies.some((m) => m.value === option.value)) {
            allMaladies.push(option);
          }
        });

        newOptions.maladies = allMaladies;
      }

      // Update filter options state
      setFilterOptions(newOptions);
    }
  }, [prophylaxies]);

  // Get type icon based on prophylaxie type
  const getTypeIcon = (type) => {
    switch (type) {
      case "Vaccination":
        return <Pill className="w-5 h-5" />;
      case "Vermifugation":
        return <Leaf className="w-5 h-5" />;
      case "Soins dentaires":
        return <Scissors className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Check if a reminder date is upcoming (within next 30 days)
  const isUpcoming = (dateString) => {
    if (!dateString) return false;

    const reminderDate = new Date(dateString);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return reminderDate >= now && reminderDate <= thirtyDaysFromNow;
  };

  // Check if a reminder date is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;

    const reminderDate = new Date(dateString);
    const now = new Date();

    return reminderDate < now;
  };

  // Toggle item expansion
  const toggleItemExpansion = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Fetch prophylaxies from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const BASE_URL = "http://localhost:3001/api";

        // Fetch prophylaxies with populated horse data
        const prophylaxiesResponse = await fetch(
          `${BASE_URL}/horse-prophylaxie`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!prophylaxiesResponse.ok)
          throw new Error("Failed to fetch prophylaxies");

        const prophylaxiesData = await prophylaxiesResponse.json();
        setProphylaxies(prophylaxiesData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProphylaxies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update active filters
    if (value) {
      setActiveFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      const { [name]: _, ...rest } = activeFilters;
      setActiveFilters(rest);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({
      type: "",
      dateStart: "",
      dateEnd: "",
      reminderStart: "",
      reminderEnd: "",
      reminderStatus: "",
      vaccin: "",
      maladie: "",
      nomProduit: "",
      typeIntervention: "",
      typeAutre: "",
      etat: "",
      race: "",
      robe: "",
      discipline: "",
      ageRange: "",
      pere: "",
      mere: "",
      taille: "",
      puce: "",
      provenance: "",
      detachement: "",
    });
    setActiveFilters({});
  };

  // Remove single filter
  const removeFilter = (name) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [name]: "",
    }));

    const { [name]: _, ...rest } = activeFilters;
    setActiveFilters(rest);
  };

  // Toggle filter section expansion
  const toggleFilterSection = (section) => {
    setExpandedFilterSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Apply filters to prophylaxies
  const filteredProphylaxies = prophylaxies
    .filter((item) => {
      // Apply search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item.horse?.name?.toLowerCase().includes(searchLower) ||
        item.horse?.matricule?.toLowerCase().includes(searchLower) ||
        item.type?.toLowerCase().includes(searchLower);

      // Apply type filter
      const matchesType = selectedFilters.type
        ? item.type === selectedFilters.type
        : true;

      // Apply date range filter
      let matchesDateRange = true;
      if (selectedFilters.dateStart) {
        matchesDateRange =
          matchesDateRange &&
          new Date(item.date) >= new Date(selectedFilters.dateStart);
      }
      if (selectedFilters.dateEnd) {
        matchesDateRange =
          matchesDateRange &&
          new Date(item.date) <= new Date(selectedFilters.dateEnd);
      }

      // Apply reminder date range filter
      let matchesReminderRange = true;
      if (selectedFilters.reminderStart) {
        matchesReminderRange =
          matchesReminderRange &&
          new Date(item.dateRappel) >= new Date(selectedFilters.reminderStart);
      }
      if (selectedFilters.reminderEnd) {
        matchesReminderRange =
          matchesReminderRange &&
          new Date(item.dateRappel) <= new Date(selectedFilters.reminderEnd);
      }

      // Apply reminder status filter
      let matchesReminderStatus = true;
      if (selectedFilters.reminderStatus === "upcoming") {
        matchesReminderStatus = isUpcoming(item.dateRappel);
      } else if (selectedFilters.reminderStatus === "overdue") {
        matchesReminderStatus = isOverdue(item.dateRappel);
      }

      // Apply type-specific filters
      let matchesTypeSpecificFilters = true;

      if (item.type === "Vaccination") {
        if (
          selectedFilters.vaccin &&
          item.details?.nomVaccin !== selectedFilters.vaccin
        ) {
          matchesTypeSpecificFilters = false;
        }

        if (selectedFilters.maladie) {
          const maladie = item.details?.maladie;
          const maladieAutre = item.details?.maladieAutre;

          if (
            selectedFilters.maladie !== maladie &&
            !(
              maladie === "Autres" &&
              maladieAutre &&
              maladieAutre
                .toLowerCase()
                .includes(selectedFilters.maladie.toLowerCase())
            )
          ) {
            matchesTypeSpecificFilters = false;
          }
        }
      }

      if (item.type === "Vermifugation") {
        if (
          selectedFilters.nomProduit &&
          item.details?.nomProduit !== selectedFilters.nomProduit
        ) {
          matchesTypeSpecificFilters = false;
        }
      }

      if (item.type === "Soins dentaires") {
        if (
          selectedFilters.typeIntervention &&
          item.details?.typeIntervention !== selectedFilters.typeIntervention
        ) {
          matchesTypeSpecificFilters = false;
        }
      }

      if (item.type === "Autre") {
        if (
          selectedFilters.typeAutre &&
          item.details?.typeAutre !== selectedFilters.typeAutre
        ) {
          matchesTypeSpecificFilters = false;
        }
      }

      // Apply horse filters
      const matchesHorseFilters =
        (!selectedFilters.race || item.horse?.race === selectedFilters.race) &&
        (!selectedFilters.discipline ||
          item.horse?.discipline === selectedFilters.discipline) &&
        (!selectedFilters.etat || item.horse?.etat === selectedFilters.etat) &&
        (!selectedFilters.robe || item.horse?.robe === selectedFilters.robe) &&
        (!selectedFilters.pere ||
          (item.horse?.pere &&
            item.horse.pere.includes(selectedFilters.pere))) &&
        (!selectedFilters.mere ||
          (item.horse?.mere &&
            item.horse.mere.includes(selectedFilters.mere))) &&
        (!selectedFilters.taille ||
          item.horse?.taille === selectedFilters.taille) &&
        (!selectedFilters.puce || item.horse?.puce === selectedFilters.puce) &&
        (!selectedFilters.provenance ||
          item.horse?.provenance === selectedFilters.provenance) &&
        (!selectedFilters.detachement ||
          item.horse?.detachement === selectedFilters.detachement);

      return (
        matchesSearch &&
        matchesType &&
        matchesDateRange &&
        matchesReminderRange &&
        matchesReminderStatus &&
        matchesTypeSpecificFilters &&
        matchesHorseFilters
      );
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "reminder-asc":
          return new Date(a.dateRappel) - new Date(b.dateRappel);
        case "reminder-desc":
          return new Date(b.dateRappel) - new Date(a.dateRappel);
        case "horse":
          return a.horse?.name?.localeCompare(b.horse?.name);
        case "type":
          return a.type?.localeCompare(b.type);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  // Handle prophylaxie deletion
  const handleDeleteProphylaxie = async (id) => {
    try {
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/prophylaxie/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete prophylaxie");

      // Refresh the list (alternative to refetching the whole list)
      setProphylaxies((prevProphylaxies) =>
        prevProphylaxies.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error deleting prophylaxie:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  // Handle navigation to edit page
  const handleEditProphylaxie = (id) => {
    router.push(`/options/prophylaxie/edit?id=${id}`);
  };

  // Handle navigation to details page
  const handleViewProphylaxie = (id) => {
    router.push(`/options/prophylaxie/view?id=${id}`);
  };

  // Handle add new prophylaxie
  const handleAddNew = () => {
    router.push("/options/prophylaxie");
  };

  // Handle export to PDF with modal
  const handleOpenPDFModal = () => {
    setIsPDFModalOpen(true);
  };

  // Handle PDF export with configuration
  const handleConfiguredPDFExport = async (exportOptions) => {
    try {
      setIsExporting(true);

      // Generate PDF with the configurations (direct download)
      generateProphylaxiePDF(
        filteredProphylaxies,
        exportOptions,
        activeFilters
      );

      // Close the modal after successful export
      setIsPDFModalOpen(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Une erreur est survenue lors de l'exportation PDF");
    } finally {
      setIsExporting(false);
    }
  };

  // Create Word export function
  const handleExportWord = () => {
    try {
      // Create an HTML representation of the data
      let html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Liste des Prophylaxies</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #1B4D3E; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #1B4D3E; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .filter-info { color: #666; margin-bottom: 20px; }
            .overdue { color: #e53e3e; }
            .upcoming { color: #dd6b20; }
          </style>
        </head>
        <body>
          <h1>Liste des Prophylaxies</h1>

      `;

      // Add filter information if any filters are active
      if (Object.keys(activeFilters).length > 0) {
        html += `<div class="filter-info"><strong>Filtres appliqués:</strong> `;

        Object.entries(activeFilters).forEach(([key, value], index, array) => {
          html += `${getFilterLabel(key, value)}${
            index < array.length - 1 ? "; " : ""
          }`;
        });

        html += `</div>`;
      }

      // Create the table
      html += `
        <table>
          <thead>
            <tr>
              <th>Cheval</th>
              <th>Type</th>
              <th>Date</th>
              <th>Rappel</th>
              <th>Détails</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
      `;

      // Add rows for each item
      filteredProphylaxies.forEach((item) => {
        // Determine if reminder is overdue or upcoming
        const reminderClass = isOverdue(item.dateRappel)
          ? "overdue"
          : isUpcoming(item.dateRappel)
          ? "upcoming"
          : "";

        // Format details based on type
        let details = "";
        switch (item.type) {
          case "Vaccination":
            details = `<strong>Vaccin:</strong> ${
              item.details?.nomVaccin || "N/A"
            }<br>
                      <strong>Maladie:</strong> ${
                        item.details?.maladie === "Autres"
                          ? item.details?.maladieAutre || "Autre"
                          : item.details?.maladie || "N/A"
                      }`;
            break;
          case "Vermifugation":
            details = `<strong>Produit:</strong> ${
              item.details?.nomProduit || "N/A"
            }`;
            break;
          case "Soins dentaires":
            details = `<strong>Intervention:</strong> ${
              item.details?.typeIntervention || "N/A"
            }`;
            break;
          case "Autre":
            details = `<strong>Type:</strong> ${
              item.details?.typeAutre || "N/A"
            }${
              item.details?.descriptionAutre
                ? `<br><strong>Description:</strong> ${item.details.descriptionAutre}`
                : ""
            }`;
            break;
          default:
            details = "N/A";
        }

        html += `
          <tr>
            <td>${item.horse?.name || "N/A"} ${
          item.horse?.matricule ? `(${item.horse.matricule})` : ""
        }</td>
            <td>${item.type || "N/A"}</td>
            <td>${formatDate(item.date)}</td>
            <td class="${reminderClass}">${formatDate(item.dateRappel)}</td>
            <td>${details}</td>
            <td>${item.notes || "N/A"}</td>
          </tr>
        `;
      });

      // Close the table and HTML document
      html += `
          </tbody>
        </table>
        </body>
        </html>
      `;

      // Create a Blob with the HTML content
      const blob = new Blob([html], { type: "application/msword" });

      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Prophylaxies_${new Date()
        .toLocaleDateString("fr-FR")
        .replace(/\//g, "-")}.doc`;

      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting Word:", error);
      alert("Une erreur est survenue lors de l'exportation Word");
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Header with Export buttons */}
        <div className="mb-10 relative">
          <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6 tracking-tight">
                Liste des prophylaxies
              </h1>
              <p className="text-gray-600 mt-3 text-lg font-medium">
                Suivi des vaccinations, vermifugations et soins préventifs
              </p>
            </div>
            <div className="flex gap-3">
              <ExportMenu
                onExportPDF={handleOpenPDFModal}
                onExportWord={handleExportWord}
                disabled={filteredProphylaxies.length === 0}
              />
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-[#1B4D3E] text-white rounded-lg flex items-center gap-2 hover:bg-[#2A9D8F] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nouvelle prophylaxie
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par cheval, matricule ou type..."
                className="w-full pl-12 text-black pr-4 py-3 rounded-xl border border-gray-200 
                         focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                         outline-none transition-all bg-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`px-4 py-3 border rounded-xl flex items-center gap-2 transition-colors ${
                Object.keys(activeFilters).length > 0
                  ? "border-[#1B4D3E] bg-[#1B4D3E]/10 text-[#1B4D3E]"
                  : "border-gray-200 hover:border-[#1B4D3E] text-gray-700"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtres
              {Object.keys(activeFilters).length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-[#1B4D3E] text-white text-xs rounded-full">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </button>
          </div>

          {/* Active filters */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center">
                <span className="text-sm font-medium text-gray-700 mr-3 mb-2">
                  Filtres appliqués:
                </span>
                {Object.entries(activeFilters).map(([key, value]) => (
                  <FilterTag
                    key={key}
                    label={getFilterLabel(key, value)}
                    onRemove={() => removeFilter(key)}
                  />
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-[#1B4D3E] hover:text-[#2A9D8F] hover:underline transition-colors ml-2"
                >
                  Effacer tout
                </button>
              </div>
            </div>
          )}

          {/* Filter panels */}
          {isFiltersOpen && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              {/* Prophylaxie Common Filters */}
              <FilterGroup
                title="Filtres généraux de prophylaxie"
                isOpen={expandedFilterSections.prophylaxie}
                onToggle={() => toggleFilterSection("prophylaxie")}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Type filter */}
                  <SelectFilter
                    label="Type de prophylaxie"
                    value={selectedFilters.type}
                    options={[
                      { value: "Vaccination", label: "Vaccination" },
                      { value: "Vermifugation", label: "Vermifugation" },
                      { value: "Soins dentaires", label: "Soins dentaires" },
                      { value: "Autre", label: "Autre" },
                    ]}
                    onChange={(value) => handleFilterChange("type", value)}
                  />

                  {/* Date range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Plage de dates (réalisation)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={selectedFilters.dateStart}
                        onChange={(e) =>
                          handleFilterChange("dateStart", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                                focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                                outline-none transition-all bg-white/50"
                      />
                      <input
                        type="date"
                        value={selectedFilters.dateEnd}
                        onChange={(e) =>
                          handleFilterChange("dateEnd", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                                focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                                outline-none transition-all bg-white/50"
                      />
                    </div>
                  </div>

                  {/* Reminder date range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Plage de dates (rappel)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={selectedFilters.reminderStart}
                        onChange={(e) =>
                          handleFilterChange("reminderStart", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                                focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                                outline-none transition-all bg-white/50"
                      />
                      <input
                        type="date"
                        value={selectedFilters.reminderEnd}
                        onChange={(e) =>
                          handleFilterChange("reminderEnd", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                                focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                                outline-none transition-all bg-white/50"
                      />
                    </div>
                  </div>

                  {/* Reminder status */}
                  <SelectFilter
                    label="Statut des rappels"
                    value={selectedFilters.reminderStatus}
                    options={[
                      { value: "upcoming", label: "À venir (30 jours)" },
                      { value: "overdue", label: "En retard" },
                    ]}
                    onChange={(value) =>
                      handleFilterChange("reminderStatus", value)
                    }
                  />

                  {/* Sort by */}
                  <SelectFilter
                    label="Trier par"
                    value={sortBy}
                    options={[
                      { value: "date-desc", label: "Date (Plus récent)" },
                      { value: "date-asc", label: "Date (Plus ancien)" },
                      { value: "reminder-asc", label: "Rappel (Plus proche)" },
                      { value: "reminder-desc", label: "Rappel (Plus loin)" },
                      { value: "horse", label: "Nom du cheval" },
                      { value: "type", label: "Type de prophylaxie" },
                    ]}
                    onChange={(value) => setSortBy(value)}
                  />
                </div>
              </FilterGroup>

              {/* Vaccination-specific filters */}
              <FilterGroup
                title="Filtres de vaccination"
                isOpen={expandedFilterSections.vaccine}
                onToggle={() => toggleFilterSection("vaccine")}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vaccine name - Dynamically populated */}
                  <SelectFilter
                    label="Nom du vaccin"
                    value={selectedFilters.vaccin}
                    options={filterOptions.vaccines}
                    onChange={(value) => handleFilterChange("vaccin", value)}
                  />

                  {/* Disease type - Dynamically populated */}
                  <SelectFilter
                    label="Maladie"
                    value={selectedFilters.maladie}
                    options={filterOptions.maladies}
                    onChange={(value) => handleFilterChange("maladie", value)}
                  />
                </div>
              </FilterGroup>

              {/* Vermifugation-specific filters */}
              <FilterGroup
                title="Filtres de vermifugation"
                isOpen={expandedFilterSections.vermifugation}
                onToggle={() => toggleFilterSection("vermifugation")}
              >
                {/* Product name - Dynamically populated */}
                <SelectFilter
                  label="Nom du produit"
                  value={selectedFilters.nomProduit}
                  options={filterOptions.produits}
                  onChange={(value) => handleFilterChange("nomProduit", value)}
                />
              </FilterGroup>

              {/* Soins dentaires-specific filters */}
              <FilterGroup
                title="Filtres de soins dentaires"
                isOpen={expandedFilterSections.soins}
                onToggle={() => toggleFilterSection("soins")}
              >
                {/* Intervention type - Dynamically populated */}
                <SelectFilter
                  label="Type d'intervention"
                  value={selectedFilters.typeIntervention}
                  options={filterOptions.interventions}
                  onChange={(value) =>
                    handleFilterChange("typeIntervention", value)
                  }
                />
              </FilterGroup>

              {/* Autre-specific filters */}
              <FilterGroup
                title="Filtres pour autres types"
                isOpen={expandedFilterSections.autre}
                onToggle={() => toggleFilterSection("autre")}
              >
                {/* Custom type - Dynamically populated */}
                <SelectFilter
                  label="Type personnalisé"
                  value={selectedFilters.typeAutre}
                  options={filterOptions.typesAutres}
                  onChange={(value) => handleFilterChange("typeAutre", value)}
                />
              </FilterGroup>

              {/* Horse Filters */}
              <FilterGroup
                title="Filtres de cheval"
                isOpen={expandedFilterSections.horse}
                onToggle={() => toggleFilterSection("horse")}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Horse Race - Dynamically populated */}
                  <SelectFilter
                    label="Race"
                    value={selectedFilters.race}
                    options={filterOptions.races}
                    onChange={(value) => handleFilterChange("race", value)}
                  />

                  {/* Horse Discipline - Dynamically populated */}
                  <SelectFilter
                    label="Discipline"
                    value={selectedFilters.discipline}
                    options={filterOptions.disciplines}
                    onChange={(value) =>
                      handleFilterChange("discipline", value)
                    }
                  />

                  {/* Horse Etat - Dynamically populated */}
                  <SelectFilter
                    label="État"
                    value={selectedFilters.etat}
                    options={filterOptions.etats}
                    onChange={(value) => handleFilterChange("etat", value)}
                  />

                  {/* Horse Robe - Dynamically populated */}
                  <SelectFilter
                    label="Robe"
                    value={selectedFilters.robe}
                    options={filterOptions.robes}
                    onChange={(value) => handleFilterChange("robe", value)}
                  />

                  {/* Horse Age Range */}
                  <SelectFilter
                    label="Âge"
                    value={selectedFilters.ageRange}
                    options={filterOptions.ageRanges}
                    onChange={(value) => handleFilterChange("ageRange", value)}
                  />

                  {/* Horse's father */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Père
                    </label>
                    <input
                      type="text"
                      value={selectedFilters.pere}
                      onChange={(e) =>
                        handleFilterChange("pere", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                              focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                              outline-none transition-all bg-white/50"
                      placeholder="Rechercher par père..."
                    />
                  </div>

                  {/* Horse's mother */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mère
                    </label>
                    <input
                      type="text"
                      value={selectedFilters.mere}
                      onChange={(e) =>
                        handleFilterChange("mere", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm
                              focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                              outline-none transition-all bg-white/50"
                      placeholder="Rechercher par mère..."
                    />
                  </div>

                  {/* Horse Taille - Dynamically populated */}
                  <SelectFilter
                    label="Taille"
                    value={selectedFilters.taille}
                    options={filterOptions.tailles}
                    onChange={(value) => handleFilterChange("taille", value)}
                  />

                  {/* Horse Provenance - Dynamically populated */}
                  <SelectFilter
                    label="Provenance"
                    value={selectedFilters.provenance}
                    options={filterOptions.provenances}
                    onChange={(value) =>
                      handleFilterChange("provenance", value)
                    }
                  />

                  {/* Horse Detachement - Dynamically populated */}
                  <SelectFilter
                    label="Détachement"
                    value={selectedFilters.detachement}
                    options={filterOptions.detachements}
                    onChange={(value) =>
                      handleFilterChange("detachement", value)
                    }
                  />
                </div>
              </FilterGroup>
            </div>
          )}
        </div>

        {/* Prophylaxie List */}
        {filteredProphylaxies.length > 0 ? (
          <div className="space-y-4">
            {filteredProphylaxies.map((item) => {
              const isUpcomingReminder = isUpcoming(item.dateRappel);
              const isOverdueReminder = isOverdue(item.dateRappel);
              const isItemExpanded = expandedItems[item._id] || false;

              return (
                <div
                  key={item._id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl ${
                            isOverdueReminder
                              ? "bg-red-100"
                              : isUpcomingReminder
                              ? "bg-amber-100"
                              : "bg-[#1B4D3E]/10"
                          }`}
                        >
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#1B4D3E]">
                              {item.type}
                            </h3>
                            {isOverdueReminder && (
                              <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Rappel dépassé
                              </div>
                            )}
                            {isUpcomingReminder && !isOverdueReminder && (
                              <div className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Rappel à venir
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600">
                            Cheval:{" "}
                            <span className="font-medium">
                              {item.horse?.name}
                            </span>
                            {item.horse?.matricule &&
                              ` (${item.horse.matricule})`}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-4">
                            <div>
                              <span className="text-sm text-gray-500">
                                Date:
                              </span>
                              <span className="ml-1 text-sm font-medium">
                                {formatDate(item.date)}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">
                                Rappel:
                              </span>
                              <span
                                className={`ml-1 text-sm font-medium ${
                                  isOverdueReminder
                                    ? "text-red-600"
                                    : isUpcomingReminder
                                    ? "text-amber-600"
                                    : ""
                                }`}
                              >
                                {formatDate(item.dateRappel)}
                              </span>
                            </div>

                            {/* Type-specific summary details */}
                            {item.type === "Vaccination" && (
                              <>
                                <div>
                                  <span className="text-sm text-gray-500">
                                    Vaccin:
                                  </span>
                                  <span className="ml-1 text-sm font-medium">
                                    {item.details?.nomVaccin || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-500">
                                    Maladie:
                                  </span>
                                  <span className="ml-1 text-sm font-medium">
                                    {item.details?.maladie === "Autres"
                                      ? item.details?.maladieAutre || "Autre"
                                      : item.details?.maladie || "N/A"}
                                  </span>
                                </div>
                              </>
                            )}

                            {item.type === "Vermifugation" && (
                              <div>
                                <span className="text-sm text-gray-500">
                                  Produit:
                                </span>
                                <span className="ml-1 text-sm font-medium">
                                  {item.details?.nomProduit || "N/A"}
                                </span>
                              </div>
                            )}

                            {item.type === "Soins dentaires" && (
                              <div>
                                <span className="text-sm text-gray-500">
                                  Intervention:
                                </span>
                                <span className="ml-1 text-sm font-medium">
                                  {item.details?.typeIntervention || "N/A"}
                                </span>
                              </div>
                            )}

                            {item.type === "Autre" && (
                              <div>
                                <span className="text-sm text-gray-500">
                                  Type:
                                </span>
                                <span className="ml-1 text-sm font-medium">
                                  {item.details?.typeAutre || "N/A"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-4 md:mt-0 space-x-2">
                        {/* <button
                          onClick={() => handleViewProphylaxie(item._id)}
                          className="p-2 text-gray-600 hover:text-[#1B4D3E] hover:bg-[#1B4D3E]/10 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-5 h-5" />
                        </button> */}
                        <button
                          onClick={() => handleEditProphylaxie(item._id)}
                          className="p-2 text-gray-600 hover:text-[#1B4D3E] hover:bg-[#1B4D3E]/10 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProphylaxie(item._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable details section */}
                    <ProphylaxieDetails
                      item={item}
                      isExpanded={isItemExpanded}
                      onToggle={() => toggleItemExpansion(item._id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            message={
              searchQuery || Object.keys(activeFilters).length > 0
                ? "Aucun résultat ne correspond à vos critères de recherche."
                : "Commencez à ajouter des prophylaxies pour suivre les soins préventifs."
            }
            onAddNew={handleAddNew}
          />
        )}
      </div>

      {/* PDF Export Configuration Modal */}
      <PDFExportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        onExport={handleConfiguredPDFExport}
        prophylaxies={filteredProphylaxies}
        defaultTitle={
          selectedFilters.type
            ? `Liste des ${selectedFilters.type.toLowerCase()}s`
            : "Liste des prophylaxies"
        }
      />
    </div>
  );
}
