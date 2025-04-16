"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  AlertCircle,
  FileText,
  Filter,
  RotateCcw,
  CheckCircle,
  Calendar,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";

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
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
        focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
        outline-none transition-all bg-white/50 appearance-none cursor-pointer flex justify-between items-center"
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

export default function RadiatedHorsesPage() {
  const router = useRouter();
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRace, setFilterRace] = useState("");
  const [filterCause, setFilterCause] = useState("");
  const [filterReference, setFilterReference] = useState("");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchRadiatedHorses();
  }, []);

  const fetchRadiatedHorses = async () => {
    try {
      setIsLoading(true);

      // Try multiple API path patterns to handle different backend implementations
      let response;
      let data;

      try {
        // First attempt
        response = await fetch("/api/radiated-horses");
        if (!response.ok) throw new Error("First attempt failed");
        data = await response.json();
      } catch (err1) {
        try {
          // Second attempt
          response = await fetch("/api/horse/radiated-horses");
          if (!response.ok) throw new Error("Second attempt failed");
          data = await response.json();
        } catch (err2) {
          try {
            // Third attempt - using query parameters
            response = await fetch("/api/horse?radiationStatus=radiated");
            if (!response.ok) throw new Error("Third attempt failed");
            data = await response.json();
          } catch (err3) {
            throw new Error("All API attempts failed");
          }
        }
      }

      // Extract horses data safely
      const horsesData = data?.data || data?.horses || [];
      setHorses(horsesData);
    } catch (err) {
      console.log(
        "Error fetching radiated horses:",
        err.message || "Unknown error"
      );
      setError("Impossible de récupérer les chevaux radiés");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRadiation = async (id) => {
    try {
      setCancellingId(id);

      // Try multiple API path patterns
      let response;

      try {
        response = await fetch(`/api/horse/${id}/cancel-radiation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("First cancel attempt failed");
      } catch (err1) {
        try {
          response = await fetch(`/api/horse/${id}/radiation/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) throw new Error("Second cancel attempt failed");
        } catch (err2) {
          throw new Error("Failed to cancel radiation");
        }
      }

      // Remove the horse from the list
      setHorses((prev) => prev.filter((horse) => horse._id !== id));
      setSuccessMessage("La radiation a été annulée avec succès.");

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.log(
        "Error cancelling radiation:",
        err.message || "Unknown error"
      );
      setError("Impossible d'annuler la radiation");
    } finally {
      setCancellingId(null);
    }
  };

  // Request sort function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Extract unique values for filters
  const uniqueRaces = useMemo(() => {
    return [...new Set(horses.filter((h) => h.race).map((h) => h.race))].sort();
  }, [horses]);

  const uniqueCauses = useMemo(() => {
    return [
      ...new Set(
        horses.filter((h) => h.cause || h.motif).map((h) => h.cause || h.motif)
      ),
    ].sort();
  }, [horses]);

  const uniqueReferences = useMemo(() => {
    return [
      ...new Set(horses.filter((h) => h.reference).map((h) => h.reference)),
    ].sort();
  }, [horses]);

  // Filter and search functions
  const filteredHorses = useMemo(() => {
    return horses.filter((horse) => {
      const matchesSearch =
        (horse.name &&
          horse.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (horse.matricule &&
          horse.matricule.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTypeFilter = filterType
        ? horse.motifderadiation === filterType
        : true;

      const matchesRaceFilter = filterRace ? horse.race === filterRace : true;

      const matchesCauseFilter = filterCause
        ? horse.cause === filterCause || horse.motif === filterCause
        : true;

      const matchesReferenceFilter = filterReference
        ? horse.reference === filterReference
        : true;

      // Date range filtering
      let matchesDateFilter = true;
      if (dateRangeStart || dateRangeEnd) {
        const horseDateRad = horse.dateRadiation
          ? new Date(horse.dateRadiation)
          : null;

        if (!horseDateRad) {
          matchesDateFilter = false;
        } else {
          if (dateRangeStart) {
            const startDate = new Date(dateRangeStart);
            if (horseDateRad < startDate) {
              matchesDateFilter = false;
            }
          }

          if (dateRangeEnd) {
            const endDate = new Date(dateRangeEnd);
            endDate.setHours(23, 59, 59, 999); // End of the day
            if (horseDateRad > endDate) {
              matchesDateFilter = false;
            }
          }
        }
      }

      return (
        matchesSearch &&
        matchesTypeFilter &&
        matchesRaceFilter &&
        matchesCauseFilter &&
        matchesReferenceFilter &&
        matchesDateFilter
      );
    });
  }, [
    horses,
    searchQuery,
    filterType,
    filterRace,
    filterCause,
    filterReference,
    dateRangeStart,
    dateRangeEnd,
  ]);

  // Sort horses based on current sort configuration
  const sortedHorses = useMemo(() => {
    if (!sortConfig.key) return filteredHorses;

    return [...filteredHorses].sort((a, b) => {
      if (sortConfig.key === "name") {
        const aValue = a.name?.toLowerCase() || "";
        const bValue = b.name?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "motif") {
        const aValue = a.motifderadiation?.toLowerCase() || "";
        const bValue = b.motifderadiation?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "date") {
        const aDate = a.dateRadiation ? new Date(a.dateRadiation).getTime() : 0;
        const bDate = b.dateRadiation ? new Date(b.dateRadiation).getTime() : 0;
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (sortConfig.key === "cause") {
        const aValue = (a.cause || a.motif || "")?.toLowerCase();
        const bValue = (b.cause || b.motif || "")?.toLowerCase();
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "reference") {
        const aValue = a.reference?.toLowerCase() || "";
        const bValue = b.reference?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [filteredHorses, sortConfig]);

  // Helper function to convert arrays to options for SearchableSelect
  const getSelectOptions = (items) => {
    return items.map((item) => ({ value: item, label: item }));
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to get badge color based on radiation type
  const getBadgeColor = (type) => {
    switch (type) {
      case "Mort":
        return "bg-red-100 text-red-800";
      case "Euthanasie":
        return "bg-red-100 text-red-800";
      case "Cession":
        return "bg-blue-100 text-blue-800";
      case "Vente":
        return "bg-green-100 text-green-800";
      case "Autre":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("");
    setFilterRace("");
    setFilterCause("");
    setFilterReference("");
    setDateRangeStart("");
    setDateRangeEnd("");
  };

  // Check if any filter is applied
  const isAnyFilterApplied = () => {
    return (
      searchQuery ||
      filterType ||
      filterRace ||
      filterCause ||
      filterReference ||
      dateRangeStart ||
      dateRangeEnd
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6 tracking-tight flex items-center">
            <button
              onClick={() => router.push("/options/radiation")}
              className="mr-3 p-1 rounded-full hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            Chevaux radiés
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">
            Liste des chevaux radiés du contrôle nominatif •{" "}
            {filteredHorses.length} chevaux affichés
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Active Filters Display */}
          {isAnyFilterApplied() && (
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Filtres actifs:</span>

              {searchQuery && (
                <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                  {`Recherche: ${searchQuery}`}
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-red-200"
                  >
                    ×
                  </button>
                </span>
              )}

              {filterType && (
                <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                  {`Motif: ${filterType}`}
                  <button
                    onClick={() => setFilterType("")}
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

              {filterCause && (
                <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                  {`Cause: ${filterCause}`}
                  <button
                    onClick={() => setFilterCause("")}
                    className="hover:text-red-200"
                  >
                    ×
                  </button>
                </span>
              )}

              {filterReference && (
                <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                  {`Référence: ${filterReference}`}
                  <button
                    onClick={() => setFilterReference("")}
                    className="hover:text-red-200"
                  >
                    ×
                  </button>
                </span>
              )}

              {dateRangeStart && (
                <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                  {`Date début: ${new Date(dateRangeStart).toLocaleDateString(
                    "fr-FR"
                  )}`}
                  <button
                    onClick={() => setDateRangeStart("")}
                    className="hover:text-red-200"
                  >
                    ×
                  </button>
                </span>
              )}

              {dateRangeEnd && (
                <span className="px-3 py-1 bg-[#1B4D3E] text-white rounded-full text-sm flex items-center gap-2">
                  {`Date fin: ${new Date(dateRangeEnd).toLocaleDateString(
                    "fr-FR"
                  )}`}
                  <button
                    onClick={() => setDateRangeEnd("")}
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

          {/* Search and Filters section */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 flex-wrap">
            {/* Search input */}
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou matricule..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                         focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                         outline-none transition-all bg-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Motif filter */}
            <div className="relative md:w-64">
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <SearchableSelect
                options={[
                  { value: "Mort", label: "Mort" },
                  { value: "Euthanasie", label: "Euthanasie" },
                  { value: "Cession", label: "Cession" },
                  { value: "Vente", label: "Vente" },
                  { value: "Autre", label: "Autre" },
                ]}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                placeholder="Rechercher un motif..."
                emptyOptionLabel="Tous les motifs"
              />
            </div>

            {/* Race filter */}
            <div className="relative md:w-64">
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <SearchableSelect
                options={getSelectOptions(uniqueRaces)}
                value={filterRace}
                onChange={(e) => setFilterRace(e.target.value)}
                placeholder="Rechercher une race..."
                emptyOptionLabel="Toutes les races"
              />
            </div>

            {/* Cause filter */}
            <div className="relative md:w-64">
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <SearchableSelect
                options={getSelectOptions(uniqueCauses)}
                value={filterCause}
                onChange={(e) => setFilterCause(e.target.value)}
                placeholder="Rechercher une cause..."
                emptyOptionLabel="Toutes les causes"
              />
            </div>

            {/* Reference filter */}
            <div className="relative md:w-64">
              <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <SearchableSelect
                options={getSelectOptions(uniqueReferences)}
                value={filterReference}
                onChange={(e) => setFilterReference(e.target.value)}
                placeholder="Rechercher une référence..."
                emptyOptionLabel="Toutes les références"
              />
            </div>

            {/* Date range filters */}
            <div className="relative md:w-64">
              <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                placeholder="Date début"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                         focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                         outline-none transition-all bg-white/50"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
              />
            </div>

            <div className="relative md:w-64">
              <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="date"
                placeholder="Date fin"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                         focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                         outline-none transition-all bg-white/50"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                min={dateRangeStart}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4D3E]"></div>
            </div>
          ) : sortedHorses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("name")}
                    >
                      <div className="flex items-center justify-between">
                        Cheval
                        {sortConfig.key === "name" &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("motif")}
                    >
                      <div className="flex items-center justify-between">
                        Motif
                        {sortConfig.key === "motif" &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("date")}
                    >
                      <div className="flex items-center justify-between">
                        Date
                        {sortConfig.key === "date" &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("cause")}
                    >
                      <div className="flex items-center justify-between">
                        Cause/Motif
                        {sortConfig.key === "cause" &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => requestSort("reference")}
                    >
                      <div className="flex items-center justify-between">
                        Référence
                        {sortConfig.key === "reference" &&
                          (sortConfig.direction === "asc" ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedHorses.map((horse) => (
                    <tr key={horse._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {horse.name}
                        </div>
                        {horse.matricule && (
                          <div className="text-xs text-gray-500">
                            Matricule: {horse.matricule}
                          </div>
                        )}
                        {horse.race && (
                          <div className="text-xs text-gray-500">
                            {horse.race}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(
                            horse.motifderadiation
                          )}`}
                        >
                          {horse.motifderadiation}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(horse.dateRadiation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {horse.cause || horse.motif || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {horse.reference || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link href={`/options/horses/${horse._id}`}>
                            <span className="text-[#1B4D3E] hover:text-[#2A9D8F] flex items-center cursor-pointer">
                              <FileText className="w-4 h-4 mr-1" /> Détails
                            </span>
                          </Link>
                          <button
                            onClick={() => handleCancelRadiation(horse._id)}
                            disabled={cancellingId === horse._id}
                            className={`text-blue-600 hover:text-blue-800 flex items-center ${
                              cancellingId === horse._id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {cancellingId === horse._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></div>
                            ) : (
                              <RotateCcw className="w-4 h-4 mr-1" />
                            )}
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {isAnyFilterApplied()
                  ? "Aucun cheval radié correspondant aux filtres"
                  : "Aucun cheval radié trouvé"}
              </p>
              {isAnyFilterApplied() && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-[#1B4D3E] hover:text-[#153729] underline"
                >
                  Effacer tous les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
