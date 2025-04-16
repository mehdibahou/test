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
  Edit,
  Save,
  PlusCircle,
  X,
  User,
  MapPin,
  Tag,
  BookOpen,
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

// Horse Search Component
function HorseSearch({ onSelect, placeholder = "Rechercher un cheval..." }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search for horses with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        // Use multiple endpoint patterns
        let response;
        let data;

        try {
          // First attempt
          const BASE_URL = "http://localhost:3001";
          response = await fetch(
            `${BASE_URL}/api/horse?search=${encodeURIComponent(searchQuery)}`
          );
          if (!response.ok) throw new Error("First search attempt failed");
          data = await response.json();
        } catch (err1) {
          try {
            // Second attempt
            const BASE_URL = "http://localhost:3001";
            response = await fetch(
              `${BASE_URL}/api/horses/search?q=${encodeURIComponent(
                searchQuery
              )}`
            );
            if (!response.ok) throw new Error("Second search attempt failed");
            data = await response.json();
          } catch (err2) {
            console.error("All horse search attempts failed");
            setSearchResults([]);
            return;
          }
        }

        setSearchResults(data.data || []);
      } catch (error) {
        console.error("Error searching horses:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="relative w-full" ref={searchRef}>
      <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                 outline-none transition-all bg-white/50"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowResults(true)}
      />

      {/* Search Results Dropdown */}
      {showResults && (searchResults.length > 0 || isSearching) && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              Recherche en cours...
            </div>
          ) : (
            searchResults.map((horse) => (
              <div
                key={horse._id}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  onSelect(horse);
                  setSearchQuery(`${horse.name} (${horse.matricule || "N/A"})`);
                  setShowResults(false);
                }}
              >
                <div className="font-medium">{horse.name}</div>
                <div className="text-xs text-gray-500">
                  {horse.matricule && `Matricule: ${horse.matricule}`}
                  {horse.race && ` | ${horse.race}`}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function RadiatedHorsesPage() {
  const router = useRouter();

  // List state
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterRace, setFilterRace] = useState("");
  const [filterRobe, setFilterRobe] = useState("");
  const [filterEtat, setFilterEtat] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterCause, setFilterCause] = useState("");
  const [filterReference, setFilterReference] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [filterPuce, setFilterPuce] = useState("");
  const [filterTaille, setFilterTaille] = useState("");
  const [filterPere, setFilterPere] = useState("");
  const [filterMere, setFilterMere] = useState("");
  const [filterProvenance, setFilterProvenance] = useState("");
  const [filterDetachement, setFilterDetachement] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    horseId: "",
    motifderadiation: "",
    dateRadiation: new Date().toISOString().split("T")[0],
    cause: "",
    reference: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);

  // Filters visibility state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchRadiatedHorses();
  }, []);

  // Reset form when changing between add/edit modes
  useEffect(() => {
    if (isEditMode && selectedHorse) {
      // In edit mode, populate with selected horse data
      setFormData({
        horseId: selectedHorse._id,
        motifderadiation: selectedHorse.motifderadiation || "",
        dateRadiation: selectedHorse.dateRadiation
          ? new Date(selectedHorse.dateRadiation).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        cause: selectedHorse.cause || selectedHorse.motif || "",
        reference: selectedHorse.reference || "",
      });
    } else if (!isEditMode) {
      // In add mode, reset form
      setFormData({
        horseId: selectedHorse?._id || "",
        motifderadiation: "",
        dateRadiation: new Date().toISOString().split("T")[0],
        cause: "",
        reference: "",
      });
    }
  }, [isEditMode, selectedHorse]);

  const fetchRadiatedHorses = async () => {
    try {
      setIsLoading(true);

      // Try multiple API path patterns to handle different backend implementations
      let response;
      let data;

      try {
        // First attempt
        const BASE_URL = "http://localhost:3001";
        response = await fetch(`${BASE_URL}/api/radiated-horses`);
        if (!response.ok) throw new Error("First attempt failed");
        data = await response.json();
      } catch (err1) {
        try {
          // Second attempt
          const BASE_URL = "http://localhost:3001";
          response = await fetch(`${BASE_URL}/api/horse/radiated-horses`);
          if (!response.ok) throw new Error("Second attempt failed");
          data = await response.json();
        } catch (err2) {
          try {
            // Third attempt - using query parameters
            const BASE_URL = "http://localhost:3001";
            response = await fetch(
              `${BASE_URL}/api/horse?radiationStatus=radiated`
            );
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
        // First attempt
        const BASE_URL = "http://localhost:3001";
        response = await fetch(`${BASE_URL}/api/horse/${id}/cancel-radiation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("First cancel attempt failed");
      } catch (err1) {
        try {
          const BASE_URL = "http://localhost:3001";
          // Second attempt
          response = await fetch(
            `${BASE_URL}/api/horse/${id}/radiation/cancel`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) throw new Error("Second cancel attempt failed");
        } catch (err2) {
          // Third attempt
          try {
            const BASE_URL = "http://localhost:3001";
            response = await fetch(
              `${BASE_URL}/api/radiated-horses/${id}/cancel`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              }
            );

            if (!response.ok) throw new Error("Third cancel attempt failed");
          } catch (err3) {
            throw new Error("Failed to cancel radiation");
          }
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

  // Handle editing existing radiation
  const handleEditRadiation = (horse) => {
    setSelectedHorse(horse);
    setIsEditMode(true);
    // Scroll to form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle form submission (both add and edit)
  const handleSubmitRadiation = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError(null);

      // Validation
      if (!formData.horseId) {
        throw new Error("Veuillez sélectionner un cheval");
      }

      if (!formData.motifderadiation) {
        throw new Error("Veuillez sélectionner un motif de radiation");
      }

      if (!formData.dateRadiation) {
        throw new Error("Veuillez sélectionner une date de radiation");
      }

      // Try multiple API endpoints for both create and update
      let response;
      const requestBody = {
        motifderadiation: formData.motifderadiation,
        dateRadiation: formData.dateRadiation,
        cause: formData.cause,
        reference: formData.reference,
      };

      if (isEditMode) {
        // Update existing radiation - try multiple endpoints
        try {
          // First attempt - RESTful endpoint pattern
          const BASE_URL = "http://localhost:3001";
          response = await fetch(
            `${BASE_URL}/api/horse/${formData.horseId}/radiation`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) throw new Error("First update attempt failed");
        } catch (err1) {
          try {
            // Second attempt - alternative endpoint pattern
            const BASE_URL = "http://localhost:3001";
            response = await fetch(
              `${BASE_URL}/api/horse/${formData.horseId}/update-radiation`,
              {
                method: "POST", // Some APIs might use POST for updates
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
              }
            );

            if (!response.ok) throw new Error("Second update attempt failed");
          } catch (err2) {
            try {
              // Third attempt - direct resource endpoint
              const BASE_URL = "http://localhost:3001";
              response = await fetch(
                `${BASE_URL}/api/radiation/${formData.horseId}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(requestBody),
                }
              );

              if (!response.ok) throw new Error("Third update attempt failed");
            } catch (err3) {
              throw new Error("Failed to update radiation information");
            }
          }
        }
      } else {
        // Add new radiation - try multiple endpoints
        try {
          // First attempt
          const BASE_URL = "http://localhost:3001";
          response = await fetch(
            `${BASE_URL}/api/horse/${formData.horseId}/radiate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            }
          );

          if (!response.ok) throw new Error("First create attempt failed");
        } catch (err1) {
          try {
            // Second attempt
            const BASE_URL = "http://localhost:3001";
            response = await fetch(
              `${BASE_URL}/api/horse/${formData.horseId}/radiation`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
              }
            );

            if (!response.ok) throw new Error("Second create attempt failed");
          } catch (err2) {
            try {
              // Third attempt
              const BASE_URL = "http://localhost:3001";
              response = await fetch(`${BASE_URL}/api/radiation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...requestBody,
                  horseId: formData.horseId,
                }),
              });

              if (!response.ok) throw new Error("Third create attempt failed");
            } catch (err3) {
              throw new Error("Failed to create radiation");
            }
          }
        }
      }

      // Success handling
      fetchRadiatedHorses(); // Refresh the list

      setSuccessMessage(
        isEditMode
          ? "La radiation a été modifiée avec succès"
          : "Le cheval a été radié avec succès"
      );

      // Reset form
      setSelectedHorse(null);
      setIsEditMode(false);
      setFormData({
        horseId: "",
        motifderadiation: "",
        dateRadiation: new Date().toISOString().split("T")[0],
        cause: "",
        reference: "",
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error submitting radiation:", err);
      setError(err.message || "Une erreur est survenue lors de l'opération");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel form editing
  const handleCancelEdit = () => {
    setSelectedHorse(null);
    setIsEditMode(false);
    setFormData({
      horseId: "",
      motifderadiation: "",
      dateRadiation: new Date().toISOString().split("T")[0],
      cause: "",
      reference: "",
    });
  };

  // Handle selection of a horse in the search component
  const handleHorseSelect = (horse) => {
    setSelectedHorse(horse);
    setFormData({
      ...formData,
      horseId: horse._id,
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

  // Extract unique values for filters
  const uniqueValues = useMemo(() => {
    return {
      races: [
        ...new Set(horses.filter((h) => h.race).map((h) => h.race)),
      ].sort(),
      robes: [
        ...new Set(horses.filter((h) => h.robe).map((h) => h.robe)),
      ].sort(),
      etat: [
        ...new Set(horses.filter((h) => h.etat).map((h) => h.etat)),
      ].sort(),
      disciplines: [
        ...new Set(horses.filter((h) => h.discipline).map((h) => h.discipline)),
      ].sort(),
      causes: [
        ...new Set(
          horses
            .filter((h) => h.cause || h.motif)
            .map((h) => h.cause || h.motif)
        ),
      ].sort(),
      references: [
        ...new Set(horses.filter((h) => h.reference).map((h) => h.reference)),
      ].sort(),
      sexes: [...new Set(horses.filter((h) => h.sex).map((h) => h.sex))].sort(),
      puces: [
        ...new Set(horses.filter((h) => h.Puce).map((h) => h.Puce)),
      ].sort(),
      tailles: [
        ...new Set(horses.filter((h) => h.Taille).map((h) => h.Taille)),
      ].sort(),
      peres: [
        ...new Set(
          horses
            .filter((h) => h.father?.name || h.fatherText)
            .map((h) => h.father?.name || h.fatherText)
        ),
      ].sort(),
      meres: [
        ...new Set(
          horses
            .filter((h) => h.mother?.name || h.motherText)
            .map((h) => h.mother?.name || h.motherText)
        ),
      ].sort(),
      provenances: [
        ...new Set(horses.filter((h) => h.Provenance).map((h) => h.Provenance)),
      ].sort(),
      detachements: [
        ...new Set(
          horses.filter((h) => h.Detachement).map((h) => h.Detachement)
        ),
      ].sort(),
    };
  }, [horses]);

  // Filter and search functions
  const filteredHorses = useMemo(() => {
    return horses.filter((horse) => {
      // Text search
      const matchesSearch =
        (horse.name &&
          horse.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (horse.matricule &&
          horse.matricule.toLowerCase().includes(searchQuery.toLowerCase()));

      // All filter conditions
      const matchesTypeFilter = filterType
        ? horse.motifderadiation === filterType
        : true;

      const matchesRaceFilter = filterRace ? horse.race === filterRace : true;

      const matchesRobeFilter = filterRobe ? horse.robe === filterRobe : true;

      const matchesEtatFilter = filterEtat ? horse.etat === filterEtat : true;

      const matchesDisciplineFilter = filterDiscipline
        ? horse.discipline === filterDiscipline
        : true;

      const matchesCauseFilter = filterCause
        ? horse.cause === filterCause || horse.motif === filterCause
        : true;

      const matchesReferenceFilter = filterReference
        ? horse.reference === filterReference
        : true;

      const matchesSexFilter = filterSex ? horse.sex === filterSex : true;

      const matchesPuceFilter = filterPuce ? horse.Puce === filterPuce : true;

      const matchesTailleFilter = filterTaille
        ? horse.Taille === filterTaille
        : true;

      const matchesPereFilter = filterPere
        ? horse.father?.name === filterPere || horse.fatherText === filterPere
        : true;

      const matchesMereFilter = filterMere
        ? horse.mother?.name === filterMere || horse.motherText === filterMere
        : true;

      const matchesProvenanceFilter = filterProvenance
        ? horse.Provenance === filterProvenance
        : true;

      const matchesDetachementFilter = filterDetachement
        ? horse.Detachement === filterDetachement
        : true;

      // Age range filtering
      let matchesAgeFilter = true;
      if (filterAgeRange && horse.birthDate) {
        const age = calculateAge(horse.birthDate);
        switch (filterAgeRange) {
          case "0-4":
            matchesAgeFilter = age >= 0 && age <= 4;
            break;
          case "5-7":
            matchesAgeFilter = age >= 5 && age <= 7;
            break;
          case "8-12":
            matchesAgeFilter = age >= 8 && age <= 12;
            break;
          case "13-15":
            matchesAgeFilter = age >= 13 && age <= 15;
            break;
          case "16-18":
            matchesAgeFilter = age >= 16 && age <= 18;
            break;
          case "18-20":
            matchesAgeFilter = age >= 18 && age <= 20;
            break;
          case ">20":
            matchesAgeFilter = age > 20;
            break;
          default:
            matchesAgeFilter = true;
        }
      }

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

      // Combined filter result
      return (
        matchesSearch &&
        matchesTypeFilter &&
        matchesRaceFilter &&
        matchesRobeFilter &&
        matchesEtatFilter &&
        matchesDisciplineFilter &&
        matchesCauseFilter &&
        matchesReferenceFilter &&
        matchesSexFilter &&
        matchesPuceFilter &&
        matchesTailleFilter &&
        matchesPereFilter &&
        matchesMereFilter &&
        matchesProvenanceFilter &&
        matchesDetachementFilter &&
        matchesAgeFilter &&
        matchesDateFilter
      );
    });
  }, [
    horses,
    searchQuery,
    filterType,
    filterRace,
    filterRobe,
    filterEtat,
    filterDiscipline,
    filterCause,
    filterReference,
    filterSex,
    filterPuce,
    filterTaille,
    filterPere,
    filterMere,
    filterProvenance,
    filterDetachement,
    filterAgeRange,
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

      // Additional sort fields
      if (sortConfig.key === "race") {
        const aValue = a.race?.toLowerCase() || "";
        const bValue = b.race?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "etat") {
        const aValue = a.etat?.toLowerCase() || "";
        const bValue = b.etat?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "robe") {
        const aValue = a.robe?.toLowerCase() || "";
        const bValue = b.robe?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "discipline") {
        const aValue = a.discipline?.toLowerCase() || "";
        const bValue = b.discipline?.toLowerCase() || "";
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

  // Function to calculate age
  const calculateAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust age if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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
    setFilterRobe("");
    setFilterEtat("");
    setFilterDiscipline("");
    setFilterCause("");
    setFilterReference("");
    setFilterSex("");
    setFilterPuce("");
    setFilterTaille("");
    setFilterPere("");
    setFilterMere("");
    setFilterProvenance("");
    setFilterDetachement("");
    setFilterAgeRange("");
    setDateRangeStart("");
    setDateRangeEnd("");
  };

  // Check if any filter is applied
  const isAnyFilterApplied = () => {
    return (
      searchQuery ||
      filterType ||
      filterRace ||
      filterRobe ||
      filterEtat ||
      filterDiscipline ||
      filterCause ||
      filterReference ||
      filterSex ||
      filterPuce ||
      filterTaille ||
      filterPere ||
      filterMere ||
      filterProvenance ||
      filterDetachement ||
      filterAgeRange ||
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
            Gestion des radiations du contrôle nominatif
          </p>
        </div>

        {/* Global error/success messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-auto text-green-700 hover:text-green-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Radiation Form Section */}
        <div
          ref={formRef}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 mb-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1B4D3E]">
              {isEditMode
                ? "Modifier une radiation"
                : "Effectuer une radiation"}
            </h2>
            {isEditMode && (
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitRadiation}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Horse Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cheval*
                </label>
                <HorseSearch
                  onSelect={handleHorseSelect}
                  placeholder="Rechercher un cheval par nom ou matricule..."
                />
                {selectedHorse && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{selectedHorse.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedHorse.matricule &&
                        `Matricule: ${selectedHorse.matricule}`}
                      {selectedHorse.race && ` | ${selectedHorse.race}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Radiation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif de radiation*
                </label>
                <select
                  value={formData.motifderadiation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      motifderadiation: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 
                           focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                           outline-none transition-all bg-white/50"
                >
                  <option value="">Sélectionner un motif</option>
                  <option value="Mort">Mort</option>
                  <option value="Euthanasie">Euthanasie</option>
                  <option value="Cession">Cession</option>
                  <option value="Vente">Vente</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Radiation Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de radiation*
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateRadiation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dateRadiation: e.target.value,
                      })
                    }
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 
                             focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                             outline-none transition-all bg-white/50"
                  />
                </div>
              </div>

              {/* Cause/Detail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cause/Détail
                </label>
                <input
                  type="text"
                  value={formData.cause}
                  onChange={(e) =>
                    setFormData({ ...formData, cause: e.target.value })
                  }
                  placeholder="Cause spécifique ou détails supplémentaires"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 
                           focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                           outline-none transition-all bg-white/50"
                />
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  placeholder="Numéro de référence ou document"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 
                           focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                           outline-none transition-all bg-white/50"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 mr-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !selectedHorse}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                  isSubmitting || !selectedHorse
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#1B4D3E] text-white hover:bg-[#153729]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Traitement en cours...
                  </>
                ) : isEditMode ? (
                  <>
                    <Save className="w-5 h-5" />
                    Mettre à jour
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Radier le cheval
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-[#1B4D3E] mb-6">
            Liste des chevaux radiés • {filteredHorses.length} chevaux
          </h2>

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

              {/* More active filter tags - collapsed for better UX */}
              {(filterSex ||
                filterPuce ||
                filterTaille ||
                filterPere ||
                filterMere ||
                filterProvenance ||
                filterDetachement ||
                filterAgeRange ||
                dateRangeStart ||
                dateRangeEnd) && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm flex items-center gap-2">
                  {`+${
                    [
                      filterSex,
                      filterPuce,
                      filterTaille,
                      filterPere,
                      filterMere,
                      filterProvenance,
                      filterDetachement,
                      filterAgeRange,
                      dateRangeStart,
                      dateRangeEnd,
                    ].filter(Boolean).length
                  } filtres`}
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

          {/* Search and Basic Filters */}
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
                options={getSelectOptions(uniqueValues.races)}
                value={filterRace}
                onChange={(e) => setFilterRace(e.target.value)}
                placeholder="Rechercher une race..."
                emptyOptionLabel="Toutes les races"
              />
            </div>

            {/* Toggle for advanced filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 text-[#1B4D3E] border border-[#1B4D3E] rounded-xl hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showAdvancedFilters
                ? "Masquer filtres avancés"
                : "Filtres avancés"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showAdvancedFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Advanced Filters - only shown when toggled */}
          {showAdvancedFilters && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* État filter */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.etat)}
                  value={filterEtat}
                  onChange={(e) => setFilterEtat(e.target.value)}
                  placeholder="Rechercher un état..."
                  emptyOptionLabel="Tous les états"
                />
              </div>

              {/* Robe filter */}
              <div className="relative">
                <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.robes)}
                  value={filterRobe}
                  onChange={(e) => setFilterRobe(e.target.value)}
                  placeholder="Rechercher une robe..."
                  emptyOptionLabel="Toutes les robes"
                />
              </div>

              {/* Discipline/Position filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.disciplines)}
                  value={filterDiscipline}
                  onChange={(e) => setFilterDiscipline(e.target.value)}
                  placeholder="Rechercher une position..."
                  emptyOptionLabel="Toutes les positions"
                />
              </div>

              {/* Cause filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.causes)}
                  value={filterCause}
                  onChange={(e) => setFilterCause(e.target.value)}
                  placeholder="Rechercher une cause..."
                  emptyOptionLabel="Toutes les causes"
                />
              </div>

              {/* Reference filter */}
              <div className="relative">
                <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.references)}
                  value={filterReference}
                  onChange={(e) => setFilterReference(e.target.value)}
                  placeholder="Rechercher une référence..."
                  emptyOptionLabel="Toutes les références"
                />
              </div>

              {/* Sex filter */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.sexes)}
                  value={filterSex}
                  onChange={(e) => setFilterSex(e.target.value)}
                  placeholder="Rechercher un sexe..."
                  emptyOptionLabel="Tous les sexes"
                />
              </div>

              {/* Puce filter */}
              <div className="relative">
                <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.puces)}
                  value={filterPuce}
                  onChange={(e) => setFilterPuce(e.target.value)}
                  placeholder="Rechercher une puce..."
                  emptyOptionLabel="Toutes les puces"
                />
              </div>

              {/* Taille filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.tailles)}
                  value={filterTaille}
                  onChange={(e) => setFilterTaille(e.target.value)}
                  placeholder="Rechercher une taille..."
                  emptyOptionLabel="Toutes les tailles"
                />
              </div>

              {/* Père filter */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.peres)}
                  value={filterPere}
                  onChange={(e) => setFilterPere(e.target.value)}
                  placeholder="Rechercher un père..."
                  emptyOptionLabel="Tous les pères"
                />
              </div>

              {/* Mère filter */}
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.meres)}
                  value={filterMere}
                  onChange={(e) => setFilterMere(e.target.value)}
                  placeholder="Rechercher une mère..."
                  emptyOptionLabel="Toutes les mères"
                />
              </div>

              {/* Provenance filter */}
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.provenances)}
                  value={filterProvenance}
                  onChange={(e) => setFilterProvenance(e.target.value)}
                  placeholder="Rechercher une provenance..."
                  emptyOptionLabel="Toutes les provenances"
                />
              </div>

              {/* Detachement filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <SearchableSelect
                  options={getSelectOptions(uniqueValues.detachements)}
                  value={filterDetachement}
                  onChange={(e) => setFilterDetachement(e.target.value)}
                  placeholder="Rechercher un detachement..."
                  emptyOptionLabel="Tous les detachements"
                />
              </div>

              {/* Age Range filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
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
                  placeholder="Rechercher une tranche d'âge..."
                  emptyOptionLabel="Tous les âges"
                />
              </div>

              {/* Date range filters */}
              <div className="relative">
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

              <div className="relative">
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
          )}

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
                          {/* <Link href={`/options/horses/${horse._id}`}>
                            <span className="text-[#1B4D3E] hover:text-[#2A9D8F] flex items-center cursor-pointer">
                              <FileText className="w-4 h-4 mr-1" /> Détails
                            </span>
                          </Link> */}

                          {/* Edit Button */}
                          {/* <button
                            onClick={() => handleEditRadiation(horse)}
                            className="text-amber-600 hover:text-amber-800 flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Modifier
                          </button> */}

                          {/* Cancel Button */}
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
