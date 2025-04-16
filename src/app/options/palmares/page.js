"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  ChevronDown,
  Download,
  FileIcon,
  FileTextIcon,
  Edit,
  Trash2,
  SlidersHorizontal,
  XIcon,
  ChevronUp, // Added for sorting indicators
} from "lucide-react";
import Papa from "papaparse";
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
} from "docx";
import { saveAs } from "file-saver";
import Link from "next/link";
import Select from "react-select";

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
  const [title, setTitle] = useState("Palmarès - Historique des performances");

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

export default function Palmares() {
  // State management
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(true);
  const [horses, setHorses] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Sorting state
  const [sortColumn, setSortColumn] = useState("date"); // Default sort by date
  const [sortDirection, setSortDirection] = useState("desc"); // Default newest first

  // Performance filters
  const [filterCompetitionType, setFilterCompetitionType] = useState("");
  const [filterCompetitionName, setFilterCompetitionName] = useState("");
  const [filterEpreuve, setFilterEpreuve] = useState("");
  const [filterLieu, setFilterLieu] = useState("");
  const [filterHeight, setFilterHeight] = useState("");
  const [filterResult, setFilterResult] = useState("");
  const [filterRider, setFilterRider] = useState("");

  // Additional horse filters (from HorseList)
  const [filterEtat, setFilterEtat] = useState("");
  const [filterRace, setFilterRace] = useState("");
  const [filterRobe, setFilterRobe] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [filterPere, setFilterPere] = useState("");
  const [filterMere, setFilterMere] = useState("");
  const [filterTaille, setFilterTaille] = useState("");
  const [filterProvenance, setFilterProvenance] = useState("");
  const [filterDetachement, setFilterDetachement] = useState("");

  // Options for dropdowns (will be fetched from API)
  const [competitionTypeOptions, setCompetitionTypeOptions] = useState([]);
  const [competitionNameOptions, setCompetitionNameOptions] = useState([]);
  const [epreuveOptions, setEpreuveOptions] = useState([]);
  const [lieuOptions, setLieuOptions] = useState([]);
  const [heightOptions, setHeightOptions] = useState([]);
  const [resultOptions, setResultOptions] = useState([]);
  const [riderOptions, setRiderOptions] = useState([]);
  const [etatOptions, setEtatOptions] = useState([
    { value: "sain", label: "Sain" },
    { value: "malade", label: "Malade" },
    { value: "en rétablissement", label: "En rétablissement" },
  ]);
  const [raceOptions, setRaceOptions] = useState([]);
  const [robeOptions, setRobeOptions] = useState([]);
  const [disciplineOptions, setDisciplineOptions] = useState([]);
  const [pereOptions, setPereOptions] = useState([]);
  const [mereOptions, setMereOptions] = useState([]);
  const [tailleOptions, setTailleOptions] = useState([]);
  const [provenanceOptions, setProvenanceOptions] = useState([]);
  const [detachementOptions, setDetachementOptions] = useState([]);

  // Age range options
  const ageRangeOptions = [
    { value: "0-4", label: "0-4 ans" },
    { value: "5-7", label: "5-7 ans" },
    { value: "8-12", label: "8-12 ans" },
    { value: "13-15", label: "13-15 ans" },
    { value: "16-18", label: "16-18 ans" },
    { value: "18-20", label: "18-20 ans" },
    { value: ">20", label: "Plus de 20 ans" },
  ];

  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentExportType, setCurrentExportType] = useState(null); // 'pdf' or 'word'

  // Column definitions
  const columns = {
    date: "Date",
    horse: "Cheval",
    discipline: "Position",
    competitionType: "Type de concours",
    competitionName: "Nom du concours",
    epreuve: "Épreuve",
    lieu: "Lieu",
    height: "Indicateur de performance",
    result: "Résultat",
    rider: "Cavalier",
    actions: "Actions",
  };

  // Visible columns state
  const [visibleColumns, setVisibleColumns] = useState({
    date: true,
    horse: true,
    discipline: true,
    competitionType: true,
    competitionName: true,
    epreuve: true,
    lieu: true,
    height: true,
    result: true,
    rider: true,
    actions: true,
  });

  // Helper function to convert array to select options
  const createSelectOptions = (values) => {
    return values
      .filter((val) => val !== null && val !== undefined && val !== "")
      .map((val) => ({ value: val, label: val }));
  };

  // Fetch initial performances and populate filter options
  const fetchInitialPerformances = async () => {
    setLoading(true);
    try {
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/horse-perf`);
      if (!response.ok) throw new Error("Failed to fetch performances");

      const { data } = await response.json();

      // Sort the data by default column and direction
      const sortedData = sortData(data || [], sortColumn, sortDirection);
      setPerformances(sortedData);

      // Extract unique values for performance filters
      if (data && data.length > 0) {
        // Get unique competition types
        const types = [
          ...new Set(data.map((perf) => perf.competitionType).filter(Boolean)),
        ];
        // If no types yet, add defaults
        if (types.length === 0) {
          types.push("CSO", "Endurance", "Course", "Autre");
        }
        setCompetitionTypeOptions(createSelectOptions(types));

        // Competition names
        setCompetitionNameOptions(
          createSelectOptions([
            ...new Set(
              data.map((perf) => perf.competitionName).filter(Boolean)
            ),
          ])
        );

        // Epreuves
        setEpreuveOptions(
          createSelectOptions([
            ...new Set(
              data
                .map((perf) => perf.epreuveCustom || perf.epreuve)
                .filter(Boolean)
            ),
          ])
        );

        // Lieux
        setLieuOptions(
          createSelectOptions([
            ...new Set(data.map((perf) => perf.lieu).filter(Boolean)),
          ])
        );

        // Heights
        setHeightOptions(
          createSelectOptions([
            ...new Set(data.map((perf) => perf.height).filter(Boolean)),
          ])
        );

        // Results
        setResultOptions(
          createSelectOptions([
            ...new Set(data.map((perf) => perf.result).filter(Boolean)),
          ])
        );

        // Riders
        setRiderOptions(
          createSelectOptions([
            ...new Set(data.map((perf) => perf.rider).filter(Boolean)),
          ])
        );
      }

      // Fetch horse data for additional filters
      try {
        const horsesResponse = await fetch(`${BASE_URL}/horse`);
        if (horsesResponse.ok) {
          const { data: horsesData } = await horsesResponse.json();
          if (horsesData && horsesData.length > 0) {
            // Extract unique values for horse filters
            setRaceOptions(
              createSelectOptions([
                ...new Set(
                  horsesData.map((horse) => horse.race).filter(Boolean)
                ),
              ])
            );

            setRobeOptions(
              createSelectOptions([
                ...new Set(
                  horsesData.map((horse) => horse.robe).filter(Boolean)
                ),
              ])
            );

            setDisciplineOptions(
              createSelectOptions([
                ...new Set(
                  horsesData.map((horse) => horse.discipline).filter(Boolean)
                ),
              ])
            );

            setPereOptions(
              createSelectOptions([
                ...new Set(
                  horsesData
                    .map((horse) => horse.father?.name || horse.fatherText)
                    .filter(Boolean)
                ),
              ])
            );

            setMereOptions(
              createSelectOptions([
                ...new Set(
                  horsesData
                    .map((horse) => horse.mother?.name || horse.motherText)
                    .filter(Boolean)
                ),
              ])
            );

            setTailleOptions(
              createSelectOptions([
                ...new Set(
                  horsesData.map((horse) => horse.Taille).filter(Boolean)
                ),
              ])
            );

            setProvenanceOptions(
              createSelectOptions([
                ...new Set(
                  horsesData.map((horse) => horse.Provenance).filter(Boolean)
                ),
              ])
            );

            setDetachementOptions(
              createSelectOptions([
                ...new Set(
                  horsesData.map((horse) => horse.Detachement).filter(Boolean)
                ),
              ])
            );
          }
        }
      } catch (horsesError) {
        console.error("Error fetching horses data for filters:", horsesError);
      }

      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des performances");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInitialPerformances();
  }, []);

  // Create a new option dynamically
  const createOption = (inputValue) => {
    return { value: inputValue, label: inputValue };
  };

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

  // Fetch filtered performances
  const fetchFilteredPerformances = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Performance filters
      if (selectedHorse?._id) params.append("horseId", selectedHorse._id);
      if (dateRange.start) params.append("startDate", dateRange.start);
      if (dateRange.end) params.append("endDate", dateRange.end);
      if (filterCompetitionType)
        params.append("competitionType", filterCompetitionType);
      if (filterCompetitionName)
        params.append("competitionName", filterCompetitionName);
      if (filterEpreuve) params.append("epreuve", filterEpreuve);
      if (filterLieu) params.append("lieu", filterLieu);
      if (filterHeight) params.append("height", filterHeight);
      if (filterResult) params.append("result", filterResult);
      if (filterRider) params.append("rider", filterRider);

      // Horse filters
      if (filterEtat) params.append("etat", filterEtat);
      if (filterRace) params.append("race", filterRace);
      if (filterRobe) params.append("robe", filterRobe);
      if (filterDiscipline) params.append("discipline", filterDiscipline);
      if (filterAgeRange) params.append("ageRange", filterAgeRange);
      if (filterPere) params.append("pere", filterPere);
      if (filterMere) params.append("mere", filterMere);
      if (filterTaille) params.append("taille", filterTaille);
      if (filterProvenance) params.append("provenance", filterProvenance);
      if (filterDetachement) params.append("detachement", filterDetachement);

      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/performance?${params}`);
      if (!response.ok) throw new Error("Failed to fetch performances");

      const { data } = await response.json();

      // Sort the data before setting it
      const sortedData = sortData(data || [], sortColumn, sortDirection);
      setPerformances(sortedData);

      // Extract unique values from the filtered results to update filter options
      if (data && data.length > 0) {
        // Update options if not filtered by this field already
        if (!filterCompetitionType) {
          const types = [
            ...new Set(
              data.map((perf) => perf.competitionType).filter(Boolean)
            ),
          ];
          setCompetitionTypeOptions((prev) => {
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newOptions = types
              .filter((type) => !existingValues.has(type))
              .map((type) => ({ value: type, label: type }));
            return [...prev, ...newOptions];
          });
        }

        if (!filterCompetitionName) {
          const names = [
            ...new Set(
              data.map((perf) => perf.competitionName).filter(Boolean)
            ),
          ];
          setCompetitionNameOptions((prev) => {
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newOptions = names
              .filter((name) => !existingValues.has(name))
              .map((name) => ({ value: name, label: name }));
            return [...prev, ...newOptions];
          });
        }

        if (!filterEpreuve) {
          const epreuves = [
            ...new Set(
              data
                .map((perf) => perf.epreuveCustom || perf.epreuve)
                .filter(Boolean)
            ),
          ];
          setEpreuveOptions((prev) => {
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newOptions = epreuves
              .filter((ep) => !existingValues.has(ep))
              .map((ep) => ({ value: ep, label: ep }));
            return [...prev, ...newOptions];
          });
        }

        if (!filterLieu) {
          const lieux = [
            ...new Set(data.map((perf) => perf.lieu).filter(Boolean)),
          ];
          setLieuOptions((prev) => {
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newOptions = lieux
              .filter((lieu) => !existingValues.has(lieu))
              .map((lieu) => ({ value: lieu, label: lieu }));
            return [...prev, ...newOptions];
          });
        }

        if (!filterHeight) {
          const heights = [
            ...new Set(data.map((perf) => perf.height).filter(Boolean)),
          ];
          setHeightOptions((prev) => {
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newOptions = heights
              .filter((height) => !existingValues.has(height))
              .map((height) => ({ value: height, label: height }));
            return [...prev, ...newOptions];
          });
        }

        if (!filterResult) {
          const results = [
            ...new Set(data.map((perf) => perf.result).filter(Boolean)),
          ];
          setResultOptions((prev) => {
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newOptions = results
              .filter((result) => !existingValues.has(result))
              .map((result) => ({ value: result, label: result }));
            return [...prev, ...newOptions];
          });
        }

        if (!filterRider) {
          const riders = [
            ...new Set(data.map((perf) => perf.rider).filter(Boolean)),
          ];
          setRiderOptions((prev) => {
            const existingValues = new Set(prev.map((opt) => opt.value));
            const newOptions = riders
              .filter((rider) => !existingValues.has(rider))
              .map((rider) => ({ value: rider, label: rider }));
            return [...prev, ...newOptions];
          });
        }

        // Also update horse-related options based on the filtered data
        try {
          const uniqueHorseIds = [
            ...new Set(
              data
                .map(
                  (perf) =>
                    perf.horse?._id ||
                    (typeof perf.horse === "string" ? perf.horse : null)
                )
                .filter(Boolean)
            ),
          ];

          if (uniqueHorseIds.length > 0) {
            const BASE_URL = "http://localhost:3001/api";
            const horseParams = new URLSearchParams();
            horseParams.append("ids", uniqueHorseIds.join(","));
            const horsesResponse = await fetch(
              `${BASE_URL}/horse?${horseParams}`
            );

            if (horsesResponse.ok) {
              const { data: horsesData } = await horsesResponse.json();

              if (horsesData && horsesData.length > 0) {
                // Update horse filter options if not already filtered
                if (!filterRace) {
                  const races = [
                    ...new Set(horsesData.map((h) => h.race).filter(Boolean)),
                  ];
                  setRaceOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = races
                      .filter((race) => !existingValues.has(race))
                      .map((race) => ({ value: race, label: race }));
                    return [...prev, ...newOptions];
                  });
                }

                if (!filterRobe) {
                  const robes = [
                    ...new Set(horsesData.map((h) => h.robe).filter(Boolean)),
                  ];
                  setRobeOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = robes
                      .filter((robe) => !existingValues.has(robe))
                      .map((robe) => ({ value: robe, label: robe }));
                    return [...prev, ...newOptions];
                  });
                }

                if (!filterDiscipline) {
                  const disciplines = [
                    ...new Set(
                      horsesData.map((h) => h.discipline).filter(Boolean)
                    ),
                  ];
                  setDisciplineOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = disciplines
                      .filter((disc) => !existingValues.has(disc))
                      .map((disc) => ({ value: disc, label: disc }));
                    return [...prev, ...newOptions];
                  });
                }

                // Continue for the rest of the horse filters...
                if (!filterPere) {
                  const peres = [
                    ...new Set(
                      horsesData
                        .map((h) => h.father?.name || h.fatherText)
                        .filter(Boolean)
                    ),
                  ];
                  setPereOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = peres
                      .filter((pere) => !existingValues.has(pere))
                      .map((pere) => ({ value: pere, label: pere }));
                    return [...prev, ...newOptions];
                  });
                }

                if (!filterMere) {
                  const meres = [
                    ...new Set(
                      horsesData
                        .map((h) => h.mother?.name || h.motherText)
                        .filter(Boolean)
                    ),
                  ];
                  setMereOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = meres
                      .filter((mere) => !existingValues.has(mere))
                      .map((mere) => ({ value: mere, label: mere }));
                    return [...prev, ...newOptions];
                  });
                }

                if (!filterTaille) {
                  const tailles = [
                    ...new Set(horsesData.map((h) => h.Taille).filter(Boolean)),
                  ];
                  setTailleOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = tailles
                      .filter((taille) => !existingValues.has(taille))
                      .map((taille) => ({ value: taille, label: taille }));
                    return [...prev, ...newOptions];
                  });
                }

                if (!filterProvenance) {
                  const provenances = [
                    ...new Set(
                      horsesData.map((h) => h.Provenance).filter(Boolean)
                    ),
                  ];
                  setProvenanceOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = provenances
                      .filter((prov) => !existingValues.has(prov))
                      .map((prov) => ({ value: prov, label: prov }));
                    return [...prev, ...newOptions];
                  });
                }

                if (!filterDetachement) {
                  const detachements = [
                    ...new Set(
                      horsesData.map((h) => h.Detachement).filter(Boolean)
                    ),
                  ];
                  setDetachementOptions((prev) => {
                    const existingValues = new Set(
                      prev.map((opt) => opt.value)
                    );
                    const newOptions = detachements
                      .filter((det) => !existingValues.has(det))
                      .map((det) => ({ value: det, label: det }));
                    return [...prev, ...newOptions];
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Error updating horse filter options:", error);
        }
      }

      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des performances");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch performances when filters change
  useEffect(() => {
    if (
      selectedHorse ||
      dateRange.start ||
      dateRange.end ||
      filterCompetitionType ||
      filterCompetitionName ||
      filterEpreuve ||
      filterLieu ||
      filterHeight ||
      filterResult ||
      filterRider ||
      filterEtat ||
      filterRace ||
      filterRobe ||
      filterDiscipline ||
      filterAgeRange ||
      filterPere ||
      filterMere ||
      filterTaille ||
      filterProvenance ||
      filterDetachement
    ) {
      fetchFilteredPerformances();
    } else if (!searchQuery) {
      fetchInitialPerformances();
    }
  }, [
    selectedHorse,
    dateRange.start,
    dateRange.end,
    filterCompetitionType,
    filterCompetitionName,
    filterEpreuve,
    filterLieu,
    filterHeight,
    filterResult,
    filterRider,
    filterEtat,
    filterRace,
    filterRobe,
    filterDiscipline,
    filterAgeRange,
    filterPere,
    filterMere,
    filterTaille,
    filterProvenance,
    filterDetachement,
  ]);

  // Sort data function
  const sortData = (data, column, direction) => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data].sort((a, b) => {
      let valueA, valueB;

      // Extract the correct values based on column
      switch (column) {
        case "date":
          valueA = new Date(a.date);
          valueB = new Date(b.date);
          break;
        case "horse":
          valueA = a.horseName || (a.horse && a.horse.name) || "";
          valueB = b.horseName || (b.horse && b.horse.name) || "";
          break;
        case "discipline":
          valueA = a.horseDiscipline || (a.horse && a.horse.discipline) || "";
          valueB = b.horseDiscipline || (b.horse && b.horse.discipline) || "";
          break;
        case "competitionType":
          valueA = a.competitionType || "";
          valueB = b.competitionType || "";
          break;
        case "competitionName":
          valueA = a.competitionName || "";
          valueB = b.competitionName || "";
          break;
        case "epreuve":
          valueA = a.epreuveCustom || a.epreuve || "";
          valueB = b.epreuveCustom || b.epreuve || "";
          break;
        case "lieu":
          valueA = a.lieu || "";
          valueB = b.lieu || "";
          break;
        case "height":
          // Try to parse as number if possible
          valueA = parseFloat(a.height) || a.height || "";
          valueB = parseFloat(b.height) || b.height || "";
          break;
        case "result":
          valueA = a.result || "";
          valueB = b.result || "";
          break;
        case "rider":
          valueA = a.rider || "";
          valueB = b.rider || "";
          break;
        default:
          valueA = a[column] || "";
          valueB = b[column] || "";
      }

      // Compare based on type
      if (valueA instanceof Date && valueB instanceof Date) {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      } else {
        // Convert to string for comparison
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        return direction === "asc"
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });

    return sortedData;
  };

  // Handle column sorting
  const handleSort = (column) => {
    // Skip sorting for the actions column
    if (column === "actions") return;

    const newDirection =
      column === sortColumn
        ? sortDirection === "asc"
          ? "desc"
          : "asc"
        : "asc";

    setSortColumn(column);
    setSortDirection(newDirection);

    // Sort the current data
    const sortedData = sortData(performances, column, newDirection);
    setPerformances(sortedData);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedHorse(null);
    setSearchQuery("");
    setDateRange({ start: "", end: "" });

    // Clear performance filters
    setFilterCompetitionType("");
    setFilterCompetitionName("");
    setFilterEpreuve("");
    setFilterLieu("");
    setFilterHeight("");
    setFilterResult("");
    setFilterRider("");

    // Clear horse filters
    setFilterEtat("");
    setFilterRace("");
    setFilterRobe("");
    setFilterDiscipline("");
    setFilterAgeRange("");
    setFilterPere("");
    setFilterMere("");
    setFilterTaille("");
    setFilterProvenance("");
    setFilterDetachement("");

    fetchInitialPerformances();
  };

  // Export to CSV
  const handleExport = () => {
    try {
      if (performances.length === 0) {
        setError("Aucune donnée à exporter");
        return;
      }

      const csvData = performances.map((perf) => {
        const data = {};

        if (visibleColumns.date)
          data["Date"] = new Date(perf.date).toLocaleDateString("fr-FR");
        if (visibleColumns.horse) {
          data["Cheval"] = perf.horseName || perf.horse?.name || "";
          data["Matricule"] =
            perf.horseMatricule || perf.horse?.matricule || "---";
        }
        if (visibleColumns.discipline)
          data["Position"] =
            perf.horseDiscipline || perf.horse?.discipline || "---";
        if (visibleColumns.competitionType)
          data["Type de concours"] = perf.competitionType || "";
        if (visibleColumns.competitionName)
          data["Nom du concours"] = perf.competitionName || "";
        if (visibleColumns.epreuve)
          data["Épreuve"] = perf.epreuveCustom || perf.epreuve || "";
        if (visibleColumns.lieu) data["Lieu"] = perf.lieu || "";
        if (visibleColumns.height)
          data["Indicateur de performance"] = perf.height || "";
        if (visibleColumns.result) data["Resultat"] = perf.result || "";
        if (visibleColumns.rider) data["Cavalier"] = perf.rider || "";

        return data;
      });

      const csv = Papa.unparse(csvData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = URL.createObjectURL(blob);
      link.download = `performances_${date}.csv`;
      link.click();
    } catch (err) {
      setError("Erreur lors de l'exportation");
      console.error(err);
    }
  };

  // Generate PDF with custom title
  const generatePDF = (customTitle) => {
    try {
      if (performances.length === 0) {
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
        columns.push({ header: "Cheval", dataKey: "horse" });
      if (visibleColumns.discipline)
        columns.push({ header: "Position", dataKey: "discipline" });
      if (visibleColumns.competitionType)
        columns.push({ header: "Type", dataKey: "competitionType" });
      if (visibleColumns.competitionName)
        columns.push({ header: "Concours", dataKey: "competitionName" });
      if (visibleColumns.epreuve)
        columns.push({ header: "Épreuve", dataKey: "epreuve" });
      if (visibleColumns.lieu)
        columns.push({ header: "Lieu", dataKey: "lieu" });
      if (visibleColumns.height)
        columns.push({ header: "Indicateur", dataKey: "height" });
      if (visibleColumns.result)
        columns.push({ header: "Résultat", dataKey: "result" });
      if (visibleColumns.rider)
        columns.push({ header: "Cavalier", dataKey: "rider" });

      // Prepare data for the table
      const tableData = performances.map((perf) => ({
        date: new Date(perf.date).toLocaleDateString("fr-FR"),
        horse:
          (perf.horseName || perf.horse?.name || "") +
          "\n" +
          (perf.horseMatricule || perf.horse?.matricule || "---"),
        discipline: perf.horseDiscipline || perf.horse?.discipline || "",
        competitionType: perf.competitionType || "",
        competitionName: perf.competitionName || "",
        epreuve: perf.epreuveCustom || perf.epreuve || "",
        lieu: perf.lieu || "",
        height: perf.height || "",
        result: perf.result || "",
        rider: perf.rider || "",
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
      doc.text(``, 14, 30);

      // Add filter information if applied
      let yPosition = 38;
      if (
        selectedHorse ||
        dateRange.start ||
        dateRange.end ||
        filterCompetitionType ||
        filterCompetitionName ||
        filterEpreuve ||
        filterLieu ||
        filterHeight ||
        filterResult ||
        filterRider
      ) {
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

        if (filterCompetitionType) {
          doc.text(
            `- Type de concours: ${filterCompetitionType}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        if (filterCompetitionName) {
          doc.text(
            `- Nom du concours: ${filterCompetitionName}`,
            20,
            yPosition
          );
          yPosition += 5;
        }

        if (filterEpreuve) {
          doc.text(`- Épreuve: ${filterEpreuve}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterLieu) {
          doc.text(`- Lieu: ${filterLieu}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterHeight) {
          doc.text(`- Indicateur: ${filterHeight}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterResult) {
          doc.text(`- Résultat: ${filterResult}`, 20, yPosition);
          yPosition += 5;
        }

        if (filterRider) {
          doc.text(`- Cavalier: ${filterRider}`, 20, yPosition);
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
          fillColor: [27, 77, 62], // #1B4D3E
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        // Special styling for results column
        columnStyles: {
          result: {
            fontStyle: "bold",
          },
        },
      });

      // Save the PDF
      doc.save(`palmares_${date.replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      setError("Erreur lors de l'exportation en PDF");
    }
  };

  // Generate Word document with custom title
  const generateWord = async (customTitle) => {
    try {
      if (performances.length === 0) {
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
          new Paragraph(""), // Empty paragraph for spacing
        ],
      });

      // Add filters information if any
      if (
        selectedHorse ||
        dateRange.start ||
        dateRange.end ||
        filterCompetitionType ||
        filterCompetitionName ||
        filterEpreuve ||
        filterLieu ||
        filterHeight ||
        filterResult ||
        filterRider
      ) {
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

        if (filterCompetitionType) {
          filterSection.push(
            new Paragraph({
              text: `- Type de concours: ${filterCompetitionType}`,
              indent: { left: 360 },
            })
          );
        }

        if (filterCompetitionName) {
          filterSection.push(
            new Paragraph({
              text: `- Nom du concours: ${filterCompetitionName}`,
              indent: { left: 360 },
            })
          );
        }

        if (filterEpreuve) {
          filterSection.push(
            new Paragraph({
              text: `- Épreuve: ${filterEpreuve}`,
              indent: { left: 360 },
            })
          );
        }

        if (filterLieu) {
          filterSection.push(
            new Paragraph({
              text: `- Lieu: ${filterLieu}`,
              indent: { left: 360 },
            })
          );
        }

        if (filterHeight) {
          filterSection.push(
            new Paragraph({
              text: `- Indicateur: ${filterHeight}`,
              indent: { left: 360 },
            })
          );
        }

        if (filterResult) {
          filterSection.push(
            new Paragraph({
              text: `- Résultat: ${filterResult}`,
              indent: { left: 360 },
            })
          );
        }

        if (filterRider) {
          filterSection.push(
            new Paragraph({
              text: `- Cavalier: ${filterRider}`,
              indent: { left: 360 },
            })
          );
        }

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
      if (visibleColumns.discipline)
        headerCells.push(createHeaderCell("Position"));
      if (visibleColumns.competitionType)
        headerCells.push(createHeaderCell("Type de concours"));
      if (visibleColumns.competitionName)
        headerCells.push(createHeaderCell("Nom du concours"));
      if (visibleColumns.epreuve) headerCells.push(createHeaderCell("Épreuve"));
      if (visibleColumns.lieu) headerCells.push(createHeaderCell("Lieu"));
      if (visibleColumns.height)
        headerCells.push(createHeaderCell("Indicateur de performance"));
      if (visibleColumns.result) headerCells.push(createHeaderCell("Résultat"));
      if (visibleColumns.rider) headerCells.push(createHeaderCell("Cavalier"));

      // Add header row to table
      tableRows.push(new TableRow({ children: headerCells }));

      // Add data rows
      performances.forEach((perf) => {
        const cells = [];

        if (visibleColumns.date) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph(new Date(perf.date).toLocaleDateString("fr-FR")),
              ],
            })
          );
        }

        if (visibleColumns.horse) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph(perf.horseName || perf.horse?.name || ""),
                new Paragraph(
                  perf.horseMatricule || perf.horse?.matricule || "---"
                ),
              ],
            })
          );
        }

        if (visibleColumns.discipline) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph(
                  perf.horseDiscipline || perf.horse?.discipline || ""
                ),
              ],
            })
          );
        }

        if (visibleColumns.competitionType) {
          cells.push(
            new TableCell({
              children: [new Paragraph(perf.competitionType || "")],
            })
          );
        }

        if (visibleColumns.competitionName) {
          cells.push(
            new TableCell({
              children: [new Paragraph(perf.competitionName || "")],
            })
          );
        }

        if (visibleColumns.epreuve) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph(perf.epreuveCustom || perf.epreuve || ""),
              ],
            })
          );
        }

        if (visibleColumns.lieu) {
          cells.push(
            new TableCell({
              children: [new Paragraph(perf.lieu || "")],
            })
          );
        }

        if (visibleColumns.height) {
          cells.push(
            new TableCell({
              children: [new Paragraph(perf.height || "")],
            })
          );
        }

        if (visibleColumns.result) {
          cells.push(
            new TableCell({
              children: [
                new Paragraph({ text: perf.result || "", bold: true }),
              ],
            })
          );
        }

        if (visibleColumns.rider) {
          cells.push(
            new TableCell({
              children: [new Paragraph(perf.rider || "")],
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
        saveAs(buffer, `palmares_${date}.docx`);
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

  // Check if any filter is applied
  const isAnyFilterApplied = () => {
    return (
      selectedHorse ||
      dateRange.start ||
      dateRange.end ||
      filterCompetitionType ||
      filterCompetitionName ||
      filterEpreuve ||
      filterLieu ||
      filterHeight ||
      filterResult ||
      filterRider ||
      filterEtat ||
      filterRace ||
      filterRobe ||
      filterDiscipline ||
      filterAgeRange ||
      filterPere ||
      filterMere ||
      filterTaille ||
      filterProvenance ||
      filterDetachement
    );
  };

  // Delete performance
  const handleDeletePerformance = async (id) => {
    try {
      setLoading(true);
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/performance/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression");
      }

      // Refresh the performances list
      if (isAnyFilterApplied()) {
        await fetchFilteredPerformances();
      } else {
        await fetchInitialPerformances();
      }
    } catch (err) {
      setError("Erreur lors de la suppression: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Custom styles for react-select
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: "0.75rem",
      borderColor: state.isFocused ? "#1B4D3E" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 1px #1B4D3E" : "none",
      "&:hover": {
        borderColor: "#1B4D3E",
      },
      padding: "0.3rem",
      fontSize: "0.875rem",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#1B4D3E"
        : state.isFocused
        ? "#1B4D3E20"
        : null,
      color: state.isSelected ? "white" : "black",
      "&:hover": {
        backgroundColor: state.isSelected ? "#1B4D3E" : "#1B4D3E20",
      },
      cursor: "pointer",
    }),
    input: (provided) => ({
      ...provided,
      color: "black",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "0.75rem",
      overflow: "hidden",
    }),
  };

  // Get performance indicator label based on competition type
  const getPerformanceIndicatorLabel = (competitionType) => {
    if (!competitionType) return "Indicateur de performance";

    switch (competitionType) {
      case "CSO":
        return "Niveau de hauteur (m)";
      case "Endurance":
      case "Course":
        return "Distance (m)";
      default:
        return "Indicateur de performance";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <div className="flex justify-between items-center mt-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B4D3E]">Palmarès</h1>
              <p className="text-gray-600 mt-2">Historique des performances</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowColumnSelector(true)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Colonnes
              </button>
              <Link
                href="/options/performance/"
                className="px-4 py-2 rounded-xl flex items-center gap-2 bg-[#1B4D3E] text-white hover:bg-[#153729] transition-colors"
              >
                Nouvelle Performance
              </Link>
              <button
                onClick={handleExport}
                disabled={performances.length === 0}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  performances.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                }`}
              >
                <Download className="w-4 h-4" />
                Exporter CSV
              </button>
              <button
                onClick={handleExportPDF}
                disabled={performances.length === 0}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  performances.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                }`}
              >
                <FileIcon className="w-4 h-4" />
                Exporter PDF
              </button>
              <button
                onClick={handleExportWord}
                disabled={performances.length === 0}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  performances.length === 0
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
            {filterCompetitionType && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Type: ${filterCompetitionType}`}
                <button
                  onClick={() => setFilterCompetitionType("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterCompetitionName && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Concours: ${filterCompetitionName}`}
                <button
                  onClick={() => setFilterCompetitionName("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterEpreuve && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Épreuve: ${filterEpreuve}`}
                <button
                  onClick={() => setFilterEpreuve("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterLieu && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Lieu: ${filterLieu}`}
                <button
                  onClick={() => setFilterLieu("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterHeight && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Indicateur: ${filterHeight}`}
                <button
                  onClick={() => setFilterHeight("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterResult && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Résultat: ${filterResult}`}
                <button
                  onClick={() => setFilterResult("")}
                  className="hover:text-red-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterRider && (
              <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                {`Cavalier: ${filterRider}`}
                <button
                  onClick={() => setFilterRider("")}
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
                    className="w-full pl-12 text-black pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!e.target.value) setSelectedHorse(null);
                    }}
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchQuery.length >= 2 && !selectedHorse && (
                  <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200">
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
                                Matricule: {horse.matricule ?? "---"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                )}
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

              {/* Type de concours Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de concours
                </label>
                <Select
                  value={
                    filterCompetitionType
                      ? {
                          value: filterCompetitionType,
                          label: filterCompetitionType,
                        }
                      : null
                  }
                  onChange={(option) =>
                    setFilterCompetitionType(option ? option.value : "")
                  }
                  options={competitionTypeOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les types de concours"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setCompetitionTypeOptions((prev) => [...prev, newOption]);
                    setFilterCompetitionType(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Nom du concours Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du concours
                </label>
                <Select
                  value={
                    filterCompetitionName
                      ? {
                          value: filterCompetitionName,
                          label: filterCompetitionName,
                        }
                      : null
                  }
                  onChange={(option) =>
                    setFilterCompetitionName(option ? option.value : "")
                  }
                  options={competitionNameOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les noms de concours"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setCompetitionNameOptions((prev) => [...prev, newOption]);
                    setFilterCompetitionName(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Épreuve Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Épreuve
                </label>
                <Select
                  value={
                    filterEpreuve
                      ? { value: filterEpreuve, label: filterEpreuve }
                      : null
                  }
                  onChange={(option) =>
                    setFilterEpreuve(option ? option.value : "")
                  }
                  options={epreuveOptions}
                  styles={customSelectStyles}
                  placeholder="Toutes les épreuves"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setEpreuveOptions((prev) => [...prev, newOption]);
                    setFilterEpreuve(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Lieu Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu
                </label>
                <Select
                  value={
                    filterLieu ? { value: filterLieu, label: filterLieu } : null
                  }
                  onChange={(option) =>
                    setFilterLieu(option ? option.value : "")
                  }
                  options={lieuOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les lieux"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setLieuOptions((prev) => [...prev, newOption]);
                    setFilterLieu(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Performance Indicator Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getPerformanceIndicatorLabel(filterCompetitionType)}
                </label>
                <Select
                  value={
                    filterHeight
                      ? { value: filterHeight, label: filterHeight }
                      : null
                  }
                  onChange={(option) =>
                    setFilterHeight(option ? option.value : "")
                  }
                  options={heightOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les indicateurs"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setHeightOptions((prev) => [...prev, newOption]);
                    setFilterHeight(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Result Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résultat
                </label>
                <Select
                  value={
                    filterResult
                      ? { value: filterResult, label: filterResult }
                      : null
                  }
                  onChange={(option) =>
                    setFilterResult(option ? option.value : "")
                  }
                  options={resultOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les résultats"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setResultOptions((prev) => [...prev, newOption]);
                    setFilterResult(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Rider Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cavalier
                </label>
                <Select
                  value={
                    filterRider
                      ? { value: filterRider, label: filterRider }
                      : null
                  }
                  onChange={(option) =>
                    setFilterRider(option ? option.value : "")
                  }
                  options={riderOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les cavaliers"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setRiderOptions((prev) => [...prev, newOption]);
                    setFilterRider(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Horse-specific filters */}
              {/* État Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État de santé
                </label>
                <Select
                  value={
                    filterEtat ? { value: filterEtat, label: filterEtat } : null
                  }
                  onChange={(option) =>
                    setFilterEtat(option ? option.value : "")
                  }
                  options={etatOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les états"
                  isClearable
                  isSearchable
                />
              </div>

              {/* Race Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Race
                </label>
                <Select
                  value={
                    filterRace ? { value: filterRace, label: filterRace } : null
                  }
                  onChange={(option) =>
                    setFilterRace(option ? option.value : "")
                  }
                  options={raceOptions}
                  styles={customSelectStyles}
                  placeholder="Toutes les races"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setRaceOptions((prev) => [...prev, newOption]);
                    setFilterRace(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Robe Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robe
                </label>
                <Select
                  value={
                    filterRobe ? { value: filterRobe, label: filterRobe } : null
                  }
                  onChange={(option) =>
                    setFilterRobe(option ? option.value : "")
                  }
                  options={robeOptions}
                  styles={customSelectStyles}
                  placeholder="Toutes les robes"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setRobeOptions((prev) => [...prev, newOption]);
                    setFilterRobe(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Discipline Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <Select
                  value={
                    filterDiscipline
                      ? { value: filterDiscipline, label: filterDiscipline }
                      : null
                  }
                  onChange={(option) =>
                    setFilterDiscipline(option ? option.value : "")
                  }
                  options={disciplineOptions}
                  styles={customSelectStyles}
                  placeholder="Toutes les positions"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setDisciplineOptions((prev) => [...prev, newOption]);
                    setFilterDiscipline(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Age Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge
                </label>
                <Select
                  value={
                    filterAgeRange
                      ? ageRangeOptions.find(
                          (option) => option.value === filterAgeRange
                        )
                      : null
                  }
                  onChange={(option) =>
                    setFilterAgeRange(option ? option.value : "")
                  }
                  options={ageRangeOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les âges"
                  isClearable
                  isSearchable
                />
              </div>

              {/* Père Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Père
                </label>
                <Select
                  value={
                    filterPere ? { value: filterPere, label: filterPere } : null
                  }
                  onChange={(option) =>
                    setFilterPere(option ? option.value : "")
                  }
                  options={pereOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les pères"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setPereOptions((prev) => [...prev, newOption]);
                    setFilterPere(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Mère Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mère
                </label>
                <Select
                  value={
                    filterMere ? { value: filterMere, label: filterMere } : null
                  }
                  onChange={(option) =>
                    setFilterMere(option ? option.value : "")
                  }
                  options={mereOptions}
                  styles={customSelectStyles}
                  placeholder="Toutes les mères"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setMereOptions((prev) => [...prev, newOption]);
                    setFilterMere(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Taille Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <Select
                  value={
                    filterTaille
                      ? { value: filterTaille, label: filterTaille }
                      : null
                  }
                  onChange={(option) =>
                    setFilterTaille(option ? option.value : "")
                  }
                  options={tailleOptions}
                  styles={customSelectStyles}
                  placeholder="Toutes les tailles"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setTailleOptions((prev) => [...prev, newOption]);
                    setFilterTaille(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Provenance Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provenance
                </label>
                <Select
                  value={
                    filterProvenance
                      ? { value: filterProvenance, label: filterProvenance }
                      : null
                  }
                  onChange={(option) =>
                    setFilterProvenance(option ? option.value : "")
                  }
                  options={provenanceOptions}
                  styles={customSelectStyles}
                  placeholder="Toutes les provenances"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setProvenanceOptions((prev) => [...prev, newOption]);
                    setFilterProvenance(inputValue);
                  }}
                  isCreatable
                />
              </div>

              {/* Detachement Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detachement
                </label>
                <Select
                  value={
                    filterDetachement
                      ? {
                          value: filterDetachement,
                          label: filterDetachement,
                        }
                      : null
                  }
                  onChange={(option) =>
                    setFilterDetachement(option ? option.value : "")
                  }
                  options={detachementOptions}
                  styles={customSelectStyles}
                  placeholder="Tous les detachements"
                  isClearable
                  isSearchable
                  formatCreateLabel={(inputValue) => `Ajouter "${inputValue}"`}
                  onCreateOption={(inputValue) => {
                    const newOption = createOption(inputValue);
                    setDetachementOptions((prev) => [...prev, newOption]);
                    setFilterDetachement(inputValue);
                  }}
                  isCreatable
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-white/70 rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B4D3E] mx-auto mb-4"></div>
              Chargement des données...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {visibleColumns.date && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center">
                          Date
                          <span className="ml-2">
                            {sortColumn === "date" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.horse && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("horse")}
                      >
                        <div className="flex items-center">
                          Cheval
                          <span className="ml-2">
                            {sortColumn === "horse" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.discipline && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("discipline")}
                      >
                        <div className="flex items-center">
                          Position
                          <span className="ml-2">
                            {sortColumn === "discipline" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.competitionType && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("competitionType")}
                      >
                        <div className="flex items-center">
                          Type de concours
                          <span className="ml-2">
                            {sortColumn === "competitionType" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.competitionName && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("competitionName")}
                      >
                        <div className="flex items-center">
                          Nom du concours
                          <span className="ml-2">
                            {sortColumn === "competitionName" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.epreuve && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("epreuve")}
                      >
                        <div className="flex items-center">
                          Épreuve
                          <span className="ml-2">
                            {sortColumn === "epreuve" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.lieu && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("lieu")}
                      >
                        <div className="flex items-center">
                          Lieu
                          <span className="ml-2">
                            {sortColumn === "lieu" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.height && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("height")}
                      >
                        <div className="flex items-center">
                          Indicateur de performance
                          <span className="ml-2">
                            {sortColumn === "height" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.result && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("result")}
                      >
                        <div className="flex items-center">
                          Résultat
                          <span className="ml-2">
                            {sortColumn === "result" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.rider && (
                      <th
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 group"
                        onClick={() => handleSort("rider")}
                      >
                        <div className="flex items-center">
                          Cavalier
                          <span className="ml-2">
                            {sortColumn === "rider" ? (
                              sortDirection === "asc" ? (
                                <ChevronUp className="w-4 h-4 text-[#1B4D3E]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#1B4D3E]" />
                              )
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </span>
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
                  {performances.length > 0 ? (
                    performances.map((performance) => (
                      <tr
                        key={performance._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {visibleColumns.date && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(performance.date).toLocaleDateString(
                              "fr-FR"
                            )}
                          </td>
                        )}
                        {visibleColumns.horse && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.horseName || performance.horse?.name}
                            <span className="text-gray-500 text-xs block">
                              {performance.horseMatricule ||
                                performance.horse?.matricule ||
                                "---"}
                            </span>
                          </td>
                        )}
                        {visibleColumns.discipline && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.horseDiscipline ||
                              performance.horse?.discipline ||
                              "---"}
                          </td>
                        )}
                        {visibleColumns.competitionType && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.competitionType || "---"}
                          </td>
                        )}
                        {visibleColumns.competitionName && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.competitionName || "---"}
                          </td>
                        )}
                        {visibleColumns.epreuve && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.epreuveCustom ||
                              performance.epreuve ||
                              "---"}
                          </td>
                        )}
                        {visibleColumns.lieu && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.lieu || "---"}
                          </td>
                        )}
                        {visibleColumns.height && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.height || "---"}
                          </td>
                        )}
                        {visibleColumns.result && (
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {performance.result || "---"}
                            </span>
                          </td>
                        )}
                        {visibleColumns.rider && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {performance.rider || "---"}
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="px-6 py-4 text-sm text-center">
                            <div className="flex items-center justify-center gap-3">
                              <Link
                                href={`/options/updateperformance?id=${performance._id}`}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() =>
                                  handleDeletePerformance(performance._id)
                                }
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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
                              Aucune performance trouvée pour les critères
                              sélectionnés
                            </p>
                            <button
                              onClick={clearFilters}
                              className="text-[#1B4D3E] hover:text-[#153729] underline text-sm"
                            >
                              Effacer les filtres
                            </button>
                          </div>
                        ) : (
                          "Aucune performance trouvée"
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
