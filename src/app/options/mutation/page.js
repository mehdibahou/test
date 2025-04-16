"use client";
import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Calendar,
  ChevronRight,
  AlertCircle,
  XCircle,
  CheckCircle,
  ArrowLeft,
  FileText,
  Filter,
  RotateCcw,
  ArrowRight,
  List,
  SlidersHorizontal,
  ChevronDown,
  X,
  ArrowUp,
  ArrowDown,
  User,
  MapPin,
  Tag,
  BookOpen,
} from "lucide-react";

// API base URL as a variable for easier configuration
const API_BASE_URL = "http://localhost:3001/api";

// Searchable Select Component
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Rechercher...",
  emptyOptionLabel = "Tous",
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

function MutationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState("select"); // select, form, list
  const [selectedHorse, setSelectedHorse] = useState(null);

  // Check for URL parameters
  useEffect(() => {
    const view = searchParams.get("view");
    const horseId = searchParams.get("horseId");

    if (view === "list") {
      setActiveView("list");
    } else if (horseId) {
      fetchHorseDetails(horseId);
    }
  }, [searchParams]);

  // Fetch horse details if an ID is provided
  const fetchHorseDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/horse/${id}`);
      if (!response.ok) throw new Error("Failed to fetch horse details");

      const data = await response.json();
      if (data.success && data.data) {
        setSelectedHorse(data.data);
        console.log(data.data);
        setActiveView("form");
      }
    } catch (error) {
      console.log("Error fetching horse details:", error.message);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (activeView === "form") {
      setActiveView("select");
      setSelectedHorse(null);
    } else if (activeView === "list") {
      setActiveView("select");
    }
  };

  // Render the appropriate view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6 tracking-tight">
            {activeView === "list" ? "Chevaux mutés" : "Mutation de cheval"}
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">
            {activeView === "list"
              ? "Liste des chevaux mutés"
              : "Processus de mutation des chevaux"}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-8 border-b">
          <button
            onClick={() => setActiveView("select")}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeView === "select" || activeView === "form"
                ? "border-[#1B4D3E] text-[#1B4D3E]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Mutation
          </button>
          <button
            onClick={() => setActiveView("list")}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeView === "list"
                ? "border-[#1B4D3E] text-[#1B4D3E]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Chevaux mutés
          </button>
        </div>

        {/* Content based on active view */}
        {activeView === "select" && (
          <HorseSelection
            onHorseSelect={(horse) => {
              setSelectedHorse(horse);
              setActiveView("form");
            }}
          />
        )}

        {activeView === "form" && selectedHorse && (
          <MutationForm
            horseId={selectedHorse._id}
            horseName={selectedHorse.name}
            horseDiscipline={selectedHorse.discipline}
            onBack={handleBack}
            onSuccess={() => setActiveView("list")}
          />
        )}

        {activeView === "list" && <MutatedHorsesList onBack={handleBack} />}
      </div>
    </div>
  );
}

/**
 * Enhanced Horse Selection Component
 * For searching and selecting horses to mutate, with improved search capability
 */
function HorseSelection({ onHorseSelect }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [horses, setHorses] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
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

  const searchHorses = async (query) => {
    if (query.length < 2) {
      setHorses([]);
      return;
    }

    try {
      setIsSearching(true);
      // Try multiple endpoint patterns for searching horses
      let response;
      let data;

      try {
        // First attempt - standard search endpoint with mutation filter
        response = await fetch(
          `${API_BASE_URL}/horse?search=${encodeURIComponent(
            query
          )}&mutationStatus=active`
        );

        if (!response.ok) throw new Error("First search attempt failed");
        data = await response.json();
      } catch (err1) {
        try {
          // Second attempt - alternative search endpoint
          response = await fetch(
            `${API_BASE_URL}/horses/search?q=${encodeURIComponent(
              query
            )}&status=active`
          );

          if (!response.ok) throw new Error("Second search attempt failed");
          data = await response.json();
        } catch (err2) {
          try {
            // Third attempt - another pattern
            response = await fetch(
              `${API_BASE_URL}/search/horses?query=${encodeURIComponent(
                query
              )}&filter=notMutated`
            );

            if (!response.ok) throw new Error("Third search attempt failed");
            data = await response.json();
          } catch (err3) {
            throw new Error("All search attempts failed");
          }
        }
      }

      // Safe handling of data
      if (data && data.data) {
        setHorses(
          data.data.filter(
            (horse) =>
              !horse?.isMutated ||
              horse?.isMutated === false ||
              horse?.isMutated === undefined
          )
        );
      } else {
        setHorses([]);
      }
    } catch (err) {
      const errorMessage =
        err && err.message ? err.message : "Recherche échouée";
      console.log("Error searching horses:", errorMessage);
      setError("La recherche a échoué");
      setHorses([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);
    searchHorses(query);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
      <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
        Sélectionnez un cheval
      </h2>

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

      <div className="relative mb-6" ref={searchRef}>
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un cheval par nom ou matricule..."
          className="w-full pl-12 text-black pr-4 py-3 rounded-xl border border-gray-200 
                   focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                   outline-none transition-all bg-white/50"
          value={searchQuery}
          onChange={handleSearchInput}
          onFocus={() => setShowResults(true)}
        />

        {/* Dropdown search results */}
        {showResults && searchQuery.length >= 2 && (
          <div className="absolute z-40 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-auto">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1B4D3E] mx-auto"></div>
                <p className="mt-2 text-gray-500">Recherche en cours...</p>
              </div>
            ) : horses.length > 0 ? (
              horses.map((horse) => (
                <div
                  key={horse._id}
                  onClick={() => {
                    onHorseSelect(horse);
                    setShowResults(false);
                  }}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                >
                  <div className="font-medium">{horse.name}</div>
                  <div className="text-sm text-gray-600">
                    {horse.matricule
                      ? `Matricule: ${horse.matricule}`
                      : "Matricule non disponible"}
                  </div>
                  {horse.race && (
                    <div className="text-xs text-gray-500 mt-1">
                      Race: {horse.race} | Discipline:{" "}
                      {horse.discipline || "N/A"}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Aucun cheval trouvé
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {horses.length > 0 && !showResults ? (
          horses.map(
            (horse) =>
              (!horse?.isMutated || horse?.isMutated === undefined) && (
                <div
                  key={horse._id}
                  onClick={() => onHorseSelect(horse)}
                  className="p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] 
                        border-2 bg-white hover:bg-gray-50 border-gray-100"
                >
                  <div className="font-medium">{horse.name}</div>
                  <div className="text-sm text-gray-600">
                    {horse.matricule
                      ? `Matricule: ${horse.matricule}`
                      : "Matricule non disponible"}
                  </div>
                  {horse.race && (
                    <div className="text-xs text-gray-500 mt-1">
                      Race: {horse.race} | Discipline: {horse.discipline}
                    </div>
                  )}
                </div>
              )
          )
        ) : !isSearching && !showResults ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              Commencez à taper pour rechercher un cheval
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={() => router.push("/options/horses")}
          className="px-6 py-2 rounded-xl font-medium text-gray-700 
                  border border-gray-300 hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

/**
 * Mutation Form Component
 * For filling out mutation details
 */
function MutationForm({
  horseId,
  horseName,
  horseDiscipline,
  onBack,
  onSuccess,
}) {
  const ancienneAffectation = horseDiscipline || "";

  const [formData, setFormData] = useState({
    dateMutation: new Date().toISOString().split("T")[0],
    nouvelleAffectation: "",
    nouvelleAffectationDetail: "",
    mutationReference: "",
  });

  const [selectedAffectationType, setSelectedAffectationType] = useState("");
  const [selectedDetail, setSelectedDetail] = useState("");
  const [showOtherDetail, setShowOtherDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Affectation options
  const affectationTypes = [
    "1er Escadron Fusiliers",
    "2ème Escadron Fusiliers",
    "Escadron Fanfare",
    "Escadron Honneurs",
    "Escadron de Commandement d'appui et des Services",
    "Jumenterie/GR",
    "Club Equestre Hippica",
    "Autre",
  ];

  // Sub-category options for each affectation type
  const affectationDetails = {
    "Escadron de Commandement d'appui et des Services": [
      "C.S.O",
      "Polo",
      "Course",
      "Endurance",
      "Voltige",
      "Poneys",
      "Club",
      "Ecurie GAADA",
      "La chasse",
      "La reprise Royale",
      "La reprise Princière",
      "Autre",
    ],
    "Jumenterie/GR": [
      "Zouada",
      "Unité Barbe",
      "Unité Arabe-Barbe",
      "Unité Polo",
      "Unité Sport",
      "Unité A.H.AR",
      "Unité Appaloosa",
      "Autre",
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAffectationTypeChange = (e) => {
    const value = e.target.value;
    setSelectedAffectationType(value);
    setSelectedDetail("");
    setShowOtherDetail(false);

    if (value === "Autre") {
      setFormData((prev) => ({
        ...prev,
        nouvelleAffectation: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        nouvelleAffectation: value,
        nouvelleAffectationDetail: "",
      }));
    }
  };

  const handleDetailChange = (e) => {
    const value = e.target.value;
    setSelectedDetail(value);
    setShowOtherDetail(value === "Autre");

    if (value !== "Autre") {
      setFormData((prev) => ({
        ...prev,
        nouvelleAffectationDetail: value,
        nouvelleAffectation: `${selectedAffectationType}-${value}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        nouvelleAffectationDetail: "",
      }));
    }
  };

  const handleCustomDetailChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      nouvelleAffectationDetail: value,
      nouvelleAffectation: `${selectedAffectationType}-${value}`,
    }));
  };

  const handleCustomAffectationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      nouvelleAffectation: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Try multiple API endpoints for mutation
      let response;

      try {
        // First attempt - standard endpoint
        response = await fetch(`${API_BASE_URL}/horse/${horseId}/mutate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("First mutation attempt failed");
      } catch (err1) {
        try {
          // Second attempt - alternative endpoint
          response = await fetch(`${API_BASE_URL}/horses/mutation/${horseId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (!response.ok) throw new Error("Second mutation attempt failed");
        } catch (err2) {
          try {
            // Third attempt - another pattern
            response = await fetch(`${API_BASE_URL}/mutation`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...formData,
                horseId: horseId,
              }),
            });

            if (!response.ok) throw new Error("Third mutation attempt failed");
          } catch (err3) {
            throw new Error("Toutes les tentatives de mutation ont échoué");
          }
        }
      }

      const data = await response.json();

      setSuccess("Le cheval a été muté avec succès");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err) {
      console.log("Form submission error:", err.message || "Unknown error");
      setError(err.message || "Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-[#1B4D3E]">
            Mutation de cheval
          </h2>
          <p className="text-gray-600 mt-1">
            {horseName
              ? `Cheval: ${horseName}`
              : "Sélectionnez un cheval pour la mutation"}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-[#1B4D3E] transition-colors flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Retour
        </button>
      </div>

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

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-700 hover:text-green-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de mutation *
          </label>
          <div className="relative">
            <input
              type="date"
              name="dateMutation"
              value={formData.dateMutation}
              onChange={handleChange}
              required
              className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-200 
                         focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ancienne affectation
          </label>
          <input
            type="text"
            name="ancienneAffectation"
            value={ancienneAffectation}
            onChange={handleChange}
            disabled
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                       focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouvelle affectation *
          </label>
          <select
            value={selectedAffectationType}
            onChange={handleAffectationTypeChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                       focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
          >
            <option value="">Sélectionnez une affectation</option>
            {affectationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {selectedAffectationType ===
            "Escadron de Commandement d'appui et des Services" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                value={selectedDetail}
                onChange={handleDetailChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 
                          focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
              >
                <option value="">Sélectionnez une catégorie</option>
                {affectationDetails[
                  "Escadron de Commandement d'appui et des Services"
                ].map((detail) => (
                  <option key={detail} value={detail}>
                    {detail}
                  </option>
                ))}
              </select>

              {showOtherDetail && (
                <input
                  type="text"
                  placeholder="Précisez la catégorie"
                  value={formData.nouvelleAffectationDetail}
                  onChange={handleCustomDetailChange}
                  required
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-200 
                            focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
                />
              )}
            </div>
          )}

          {selectedAffectationType === "Jumenterie/GR" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité *
              </label>
              <select
                value={selectedDetail}
                onChange={handleDetailChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 
                          focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
              >
                <option value="">Sélectionnez une unité</option>
                {affectationDetails["Jumenterie/GR"].map((detail) => (
                  <option key={detail} value={detail}>
                    {detail}
                  </option>
                ))}
              </select>

              {showOtherDetail && (
                <input
                  type="text"
                  placeholder="Précisez l'unité"
                  value={formData.nouvelleAffectationDetail}
                  onChange={handleCustomDetailChange}
                  required
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-200 
                            focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
                />
              )}
            </div>
          )}

          {selectedAffectationType === "Autre" && (
            <input
              type="text"
              placeholder="Précisez l'affectation"
              value={formData.nouvelleAffectation}
              onChange={handleCustomAffectationChange}
              required
              className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-200 
                        focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Référence *
          </label>
          <input
            type="text"
            name="mutationReference"
            value={formData.mutationReference}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                       focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
            placeholder="Numéro de référence ou document"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 mr-4 rounded-xl font-medium text-gray-700 
                       border border-gray-300 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 
                      transition-all transform hover:scale-[1.02] ${
                        isSubmitting
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white shadow-lg hover:shadow-xl"
                      }`}
          >
            {isSubmitting ? (
              <>
                Traitement...
                <div className="h-5 w-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                Confirmer la mutation
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper component for filter group UI
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

// Helper component for active filter tag UI
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

/**
 * Enhanced Mutated Horses List Component
 * Displays all mutated horses with improved search, filter, and sort capabilities
 */
function MutatedHorsesList({ onBack }) {
  const [horses, setHorses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Filter states
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Default filter options
  const defaultFilterOptions = {
    disciplines: [],
    races: [],
    nouvellesAffectations: [],
    references: [],
    sexes: [],
    robes: [],
  };

  // Filter state
  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    discipline: "",
    race: "",
    nouvelleAffectation: "",
    reference: "",
    dateStart: "",
    dateEnd: "",
    sex: "",
    robe: "",
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // State for expanded filter sections
  const [expandedFilterSections, setExpandedFilterSections] = useState({
    general: true,
    details: false,
  });

  useEffect(() => {
    fetchMutatedHorses();
  }, []);

  const fetchMutatedHorses = async () => {
    try {
      setIsLoading(true);

      // Try multiple API path patterns to handle different backend implementations
      let response;
      let data;

      try {
        // First attempt
        response = await fetch(`${API_BASE_URL}/mutated-horses`);
        if (!response.ok) throw new Error("First attempt failed");
        data = await response.json();
      } catch (err1) {
        try {
          // Second attempt
          response = await fetch(`${API_BASE_URL}/horse/mutated-horses`);
          if (!response.ok) throw new Error("Second attempt failed");
          data = await response.json();
        } catch (err2) {
          try {
            // Third attempt - using query parameters
            response = await fetch(
              `${API_BASE_URL}/horse?mutationStatus=mutated`
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

      // Extract filter options dynamically from the data
      extractFilterOptions(horsesData);
    } catch (err) {
      console.log(
        "Error fetching mutated horses:",
        err.message || "Unknown error"
      );
      setError("Impossible de récupérer les chevaux mutés");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract filter options from horses data
  const extractFilterOptions = (horsesData) => {
    if (!horsesData || horsesData.length === 0) return;

    // Helper function to extract unique values and format as options
    const extractOptions = (getValueFn) => {
      return [
        ...new Set(
          horsesData.map(getValueFn).filter(Boolean) // Remove null/undefined values
        ),
      ].map((value) => ({ value, label: value }));
    };

    // Extract all filter options
    const extractedOptions = {
      disciplines: extractOptions((horse) => horse.discipline),
      races: extractOptions((horse) => horse.race),
      nouvellesAffectations: extractOptions(
        (horse) => horse.nouvelleAffectation
      ),
      references: extractOptions((horse) => horse.mutationReference),
      sexes: extractOptions((horse) => horse.sex),
      robes: extractOptions((horse) => horse.robe),
    };

    // Update filter options state
    setFilterOptions(extractedOptions);
  };

  const handleCancelMutation = async (id) => {
    try {
      setCancellingId(id);

      // Try multiple API path patterns
      let response;

      try {
        response = await fetch(`${API_BASE_URL}/horse/${id}/cancel-mutation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("First cancel attempt failed");
      } catch (err1) {
        try {
          response = await fetch(
            `${API_BASE_URL}/horse/${id}/mutation/cancel`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!response.ok) throw new Error("Second cancel attempt failed");
        } catch (err2) {
          try {
            response = await fetch(`${API_BASE_URL}/mutation/${id}/cancel`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error("Third cancel attempt failed");
          } catch (err3) {
            throw new Error("Failed to cancel mutation");
          }
        }
      }

      // Remove the horse from the list
      setHorses((prev) => prev.filter((horse) => horse._id !== id));
      setSuccessMessage("La mutation a été annulée avec succès.");

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.log("Error cancelling mutation:", err.message || "Unknown error");
      setError("Impossible d'annuler la mutation");
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

  // Filter handling
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
      discipline: "",
      race: "",
      nouvelleAffectation: "",
      reference: "",
      dateStart: "",
      dateEnd: "",
      sex: "",
      robe: "",
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

  // Filter and search functions
  const filteredHorses = useMemo(() => {
    return horses.filter((horse) => {
      // Text search
      const matchesSearch =
        (horse.name &&
          horse.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (horse.matricule &&
          horse.matricule.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by discipline
      const matchesDiscipline =
        !selectedFilters.discipline ||
        horse.discipline === selectedFilters.discipline;

      // Filter by race
      const matchesRace =
        !selectedFilters.race || horse.race === selectedFilters.race;

      // Filter by nouvelleAffectation
      const matchesAffectation =
        !selectedFilters.nouvelleAffectation ||
        horse.nouvelleAffectation === selectedFilters.nouvelleAffectation;

      // Filter by reference
      const matchesReference =
        !selectedFilters.reference ||
        horse.mutationReference === selectedFilters.reference;

      // Filter by sex
      const matchesSex =
        !selectedFilters.sex || horse.sex === selectedFilters.sex;

      // Filter by robe
      const matchesRobe =
        !selectedFilters.robe || horse.robe === selectedFilters.robe;

      // Filter by date range
      let matchesDateRange = true;
      if (selectedFilters.dateStart) {
        matchesDateRange =
          matchesDateRange &&
          new Date(horse.dateMutation) >= new Date(selectedFilters.dateStart);
      }
      if (selectedFilters.dateEnd) {
        matchesDateRange =
          matchesDateRange &&
          new Date(horse.dateMutation) <= new Date(selectedFilters.dateEnd);
      }

      return (
        matchesSearch &&
        matchesDiscipline &&
        matchesRace &&
        matchesAffectation &&
        matchesReference &&
        matchesSex &&
        matchesRobe &&
        matchesDateRange
      );
    });
  }, [horses, searchQuery, selectedFilters]);

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

      if (sortConfig.key === "date") {
        const aDate = a.dateMutation ? new Date(a.dateMutation).getTime() : 0;
        const bDate = b.dateMutation ? new Date(b.dateMutation).getTime() : 0;
        return sortConfig.direction === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (sortConfig.key === "discipline") {
        const aValue = a.discipline?.toLowerCase() || "";
        const bValue = b.discipline?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "affectation") {
        const aValue = a.nouvelleAffectation?.toLowerCase() || "";
        const bValue = b.nouvelleAffectation?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.key === "reference") {
        const aValue = a.mutationReference?.toLowerCase() || "";
        const bValue = b.mutationReference?.toLowerCase() || "";
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [filteredHorses, sortConfig]);

  // Function to get filter label
  const getFilterLabel = (name, value) => {
    switch (name) {
      case "discipline":
        return `Discipline: ${value}`;
      case "race":
        return `Race: ${value}`;
      case "nouvelleAffectation":
        return `Affectation: ${value}`;
      case "reference":
        return `Référence: ${value}`;
      case "dateStart":
        return `Du: ${formatDate(value, true)}`;
      case "dateEnd":
        return `Au: ${formatDate(value, true)}`;
      case "sex":
        return `Sexe: ${value}`;
      case "robe":
        return `Robe: ${value}`;
      default:
        return `${name}: ${value}`;
    }
  };

  // Function to format date
  const formatDate = (dateString, shortFormat = false) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);

    if (shortFormat) {
      return date.toLocaleDateString("fr-FR");
    }

    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
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

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
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
            {/* General Filters */}
            <FilterGroup
              title="Filtres généraux"
              isOpen={expandedFilterSections.general}
              onToggle={() => toggleFilterSection("general")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Discipline filter - now with searchable select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discipline
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <SearchableSelect
                      options={filterOptions.disciplines}
                      value={selectedFilters.discipline}
                      onChange={(e) =>
                        handleFilterChange("discipline", e.target.value)
                      }
                      placeholder="Rechercher une discipline..."
                      emptyOptionLabel="Toutes les disciplines"
                    />
                  </div>
                </div>

                {/* Race filter - now with searchable select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Race
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <SearchableSelect
                      options={filterOptions.races}
                      value={selectedFilters.race}
                      onChange={(e) =>
                        handleFilterChange("race", e.target.value)
                      }
                      placeholder="Rechercher une race..."
                      emptyOptionLabel="Toutes les races"
                    />
                  </div>
                </div>

                {/* Date range */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plage de dates (mutation)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={selectedFilters.dateStart}
                        onChange={(e) =>
                          handleFilterChange("dateStart", e.target.value)
                        }
                        className="w-full pl-12 pr-3 py-3 rounded-xl border border-gray-200 
                                focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                                outline-none transition-all bg-white/50"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={selectedFilters.dateEnd}
                        onChange={(e) =>
                          handleFilterChange("dateEnd", e.target.value)
                        }
                        className="w-full pl-12 pr-3 py-3 rounded-xl border border-gray-200 
                                focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                                outline-none transition-all bg-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FilterGroup>

            {/* Detailed Filters */}
            <FilterGroup
              title="Filtres avancés"
              isOpen={expandedFilterSections.details}
              onToggle={() => toggleFilterSection("details")}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nouvelle affectation filter - now with searchable select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouvelle affectation
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <SearchableSelect
                      options={filterOptions.nouvellesAffectations}
                      value={selectedFilters.nouvelleAffectation}
                      onChange={(e) =>
                        handleFilterChange(
                          "nouvelleAffectation",
                          e.target.value
                        )
                      }
                      placeholder="Rechercher une affectation..."
                      emptyOptionLabel="Toutes les affectations"
                    />
                  </div>
                </div>

                {/* Reference filter - now with searchable select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Référence
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <SearchableSelect
                      options={filterOptions.references}
                      value={selectedFilters.reference}
                      onChange={(e) =>
                        handleFilterChange("reference", e.target.value)
                      }
                      placeholder="Rechercher une référence..."
                      emptyOptionLabel="Toutes les références"
                    />
                  </div>
                </div>

                {/* Sex filter - now with searchable select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sexe
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <SearchableSelect
                      options={filterOptions.sexes}
                      value={selectedFilters.sex}
                      onChange={(e) =>
                        handleFilterChange("sex", e.target.value)
                      }
                      placeholder="Rechercher un sexe..."
                      emptyOptionLabel="Tous les sexes"
                    />
                  </div>
                </div>

                {/* Robe filter - now with searchable select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Robe
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <SearchableSelect
                      options={filterOptions.robes}
                      value={selectedFilters.robe}
                      onChange={(e) =>
                        handleFilterChange("robe", e.target.value)
                      }
                      placeholder="Rechercher une robe..."
                      emptyOptionLabel="Toutes les robes"
                    />
                  </div>
                </div>
              </div>
            </FilterGroup>
          </div>
        )}
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
                  onClick={() => requestSort("date")}
                >
                  <div className="flex items-center justify-between">
                    Date de mutation
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
                  onClick={() => requestSort("discipline")}
                >
                  <div className="flex items-center justify-between">
                    Discipline
                    {sortConfig.key === "discipline" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("affectation")}
                >
                  <div className="flex items-center justify-between">
                    Nouvelle affectation
                    {sortConfig.key === "affectation" &&
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
                      <div className="text-xs text-gray-500">{horse.race}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(horse.dateMutation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.discipline || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.nouvelleAffectation || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {horse.mutationReference || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      {/* <Link href={`/options/horses/${horse._id}`}>
                        <span className="text-[#1B4D3E] hover:text-[#2A9D8F] flex items-center cursor-pointer">
                          <FileText className="w-4 h-4 mr-1" /> Détails
                        </span>
                      </Link> */}
                      <button
                        onClick={() => handleCancelMutation(horse._id)}
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
            {Object.keys(activeFilters).length > 0
              ? "Aucun cheval muté ne correspond aux filtres appliqués"
              : "Aucun cheval muté trouvé"}
          </p>
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-[#1B4D3E] hover:text-[#153729] underline"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1B4D3E] border-t-transparent"></div>
        <div className="text-gray-600">Chargement...</div>
      </div>
    </div>
  );
}

export default function MutationPage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <MutationPageContent />
    </Suspense>
  );
}
