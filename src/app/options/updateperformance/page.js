"use client";
import React, { useState, useEffect, Suspense } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function UpdatePerformanceForm() {
  const router = useRouter();

  // Form states
  const [selectedHorse, setSelectedHorse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    competitionType: "",
    competitionName: "",
    epreuve: "",
    epreuveCustom: "",
    lieu: "",
    height: "",
    result: "",
    rider: "",
  });
  const [performanceId, setPerformanceId] = useState("");

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [horses, setHorses] = useState([]);
  const [currentHorse, setCurrentHorse] = useState(null);

  // Competition type options
  const competitionTypes = ["CSO", "Endurance", "Course", "Autre"];

  // CSO epreuve options
  const epreuveOptions = [
    "CSO1*",
    "CSO2*",
    "CSO3*",
    "CSO4*",
    "CJC4ans",
    "CJC5ans",
    "championat du maroc",
    "coupe du trone",
    "autre",
  ];

  // Get performance ID from URL (client-side only)
  useEffect(() => {
    // Extract ID from URL (e.g., /performance/update?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
      router.push("/options/palmares");
      return;
    }

    setPerformanceId(id);
    fetchPerformanceData(id);
  }, [router]);

  // Fetch existing performance data
  const fetchPerformanceData = async (id) => {
    try {
      setIsLoading(true);
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/performance/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return router.push("/options/palmares");
      }

      const data = await response.json();
      const performance = data.data;

      if (!performance) {
        return router.push("/options/palmares");
      }

      // Format date for input field (YYYY-MM-DD)
      const formattedDate = performance.date
        ? new Date(performance.date).toISOString().split("T")[0]
        : "";

      // Handle legacy data that might not have the new fields
      const competitionType = performance.competitionType || "Autre";
      const competitionName = performance.competitionName || "";
      const epreuve = performance.epreuve || "";
      const epreuveCustom = performance.epreuveCustom || "";
      const lieu = performance.lieu || "";

      // If there's a legacy 'competition' field without the new fields,
      // use it as competitionName for backward compatibility
      const legacyCompetition = performance.competition || "";
      const finalCompetitionName =
        competitionName ||
        (competitionType === "Autre" ? legacyCompetition : "");

      setFormData({
        date: formattedDate,
        competitionType,
        competitionName: finalCompetitionName,
        epreuve,
        epreuveCustom,
        lieu,
        height: performance.height || "",
        result: performance.result || "",
        rider: performance.rider || "",
      });

      setSelectedHorse(performance.horse);

      // Fetch horse details
      if (performance.horse._id) {
        const horseResponse = await fetch(
          `${BASE_URL}/horse/${performance.horse._id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (horseResponse.ok) {
          const horseData = await horseResponse.json();
          setCurrentHorse(horseData.data);
          setSearchQuery(horseData.data?.name || "");
        }
      }
    } catch (error) {
      console.error("Error fetching performance:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Search horses function
  const searchHorses = async (searchText) => {
    try {
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(
        `${BASE_URL}/horse?search=${encodeURIComponent(searchText)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Recherche échouée");
      }

      const horses = await response.json();
      setHorses(horses.data || []);
    } catch (error) {
      console.error("Error searching horses:", error);
      setHorses([]);
    }
  };

  // Handle search input
  const handleSearchInput = async (e) => {
    const searchText = e.target.value;
    setSearchQuery(searchText);

    if (searchText.length >= 2) {
      await searchHorses(searchText);
    } else {
      setHorses([]);
    }
  };

  // Handle horse selection
  const handleHorseSelect = (horse) => {
    setSelectedHorse(horse);
    setSearchQuery(horse.name);
    setCurrentHorse(horse);
    setHorses([]);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset epreuve when competition type changes
    if (name === "competitionType" && value !== "CSO") {
      setFormData((prev) => ({
        ...prev,
        epreuve: "",
        epreuveCustom: "",
      }));
    }

    // Reset epreuveCustom when epreuve is not "autre"
    if (name === "epreuve" && value !== "autre") {
      setFormData((prev) => ({
        ...prev,
        epreuveCustom: "",
      }));
    }
  };

  // Get performance indicator label based on competition type
  const getPerformanceIndicatorLabel = () => {
    switch (formData.competitionType) {
      case "CSO":
        return "Niveau de hauteur (m)";
      case "Endurance":
      case "Course":
        return "Distance (m)";
      default:
        return "Indicateur de performance";
    }
  };

  // Get performance indicator placeholder based on competition type
  const getPerformanceIndicatorPlaceholder = () => {
    switch (formData.competitionType) {
      case "CSO":
        return "Ex: 1.20";
      case "Endurance":
      case "Course":
        return "Ex: 2000";
      default:
        return "Indicateur de performance";
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      if (
        !selectedHorse ||
        !formData.date ||
        !formData.competitionType ||
        !formData.lieu ||
        !formData.rider
      ) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      // Validate competition name for "Autre" type
      if (formData.competitionType === "Autre" && !formData.competitionName) {
        throw new Error("Veuillez spécifier le nom du concours");
      }

      // Validate epreuve for CSO
      if (formData.competitionType === "CSO" && !formData.epreuve) {
        throw new Error("Veuillez sélectionner une épreuve");
      }

      // Validate custom epreuve
      if (
        formData.competitionType === "CSO" &&
        formData.epreuve === "autre" &&
        !formData.epreuveCustom
      ) {
        throw new Error("Veuillez spécifier le nom de l'épreuve");
      }

      const formattedDate = new Date(formData.date).toISOString();

      const performanceData = {
        horseId: selectedHorse._id,
        date: formattedDate,
        competitionType: formData.competitionType,
        competitionName:
          formData.competitionType === "Autre"
            ? formData.competitionName.trim()
            : undefined,
        epreuve:
          formData.competitionType === "CSO" ? formData.epreuve : undefined,
        epreuveCustom:
          formData.competitionType === "CSO" && formData.epreuve === "autre"
            ? formData.epreuveCustom.trim()
            : undefined,
        lieu: formData.lieu.trim(),
        height: formData.height.trim(),
        result: formData.result.trim(),
        rider: formData.rider.trim(),
      };

      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/performance/${performanceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(performanceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erreur lors de la mise à jour de la performance"
        );
      }

      setSuccess("Performance mise à jour avec succès");

      // Redirect after short delay
      setTimeout(() => {
        router.push("/options/palmares");
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top Bar with Back Button */}
      <div className="bg-white shadow-sm py-4 px-6">
        <Link
          href="/options/palmares"
          className="flex items-center text-[#1B4D3E] hover:text-[#153729] transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Retour au palmarès</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="mx-10 px-6 py-12">
        {/* Form Title */}
        <div className="mb-10 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6">
            Modifier la Performance
          </h1>
          <p className="text-gray-600 mt-2">
            Mettez à jour les informations de performance
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Horse Selection Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Sélection du Cheval
            </h2>

            {/* Current Horse */}
            {currentHorse && (
              <div className="mb-4 p-4 bg-[#1B4D3E]/10 rounded-xl">
                <h3 className="font-medium text-[#1B4D3E]">Cheval actuel</h3>
                <p>
                  {currentHorse.name} (Matricule: {currentHorse.matricule})
                </p>
              </div>
            )}

            {/* Search Box */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un autre cheval par nom ou matricule..."
                className="w-full pl-12 pr-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                value={searchQuery}
                onChange={handleSearchInput}
              />
            </div>

            {/* Horse Cards */}
            {horses.length > 0 && (
              <div className="max-h-96 overflow-y-auto rounded-xl border border-gray-200">
                {horses.map((horse) => (
                  <div
                    key={horse._id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedHorse._id === horse._id
                        ? "bg-[#1B4D3E] text-white"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleHorseSelect(horse)}
                  >
                    <div className="font-medium">{horse.name}</div>
                    <div
                      className={`text-sm ${
                        selectedHorse._id === horse._id
                          ? "text-white/80"
                          : "text-gray-600"
                      }`}
                    >
                      Matricule: {horse.matricule}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Performance Details */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Détails de la Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  required
                />
              </div>

              {/* Lieu du concours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu du concours *
                </label>
                <input
                  type="text"
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleInputChange}
                  placeholder="Lieu du concours"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  required
                />
              </div>

              {/* Type de concours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de concours *
                </label>
                <select
                  name="competitionType"
                  value={formData.competitionType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  required
                >
                  <option value="">Sélectionnez un type</option>
                  {competitionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Competition Name (if "Autre" is selected) */}
              {formData.competitionType === "Autre" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du concours *
                  </label>
                  <input
                    type="text"
                    name="competitionName"
                    value={formData.competitionName}
                    onChange={handleInputChange}
                    placeholder="Spécifiez le nom du concours"
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    required
                  />
                </div>
              )}

              {/* Epreuve (only for CSO) */}
              {formData.competitionType === "CSO" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Épreuve *
                  </label>
                  <select
                    name="epreuve"
                    value={formData.epreuve}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    required
                  >
                    <option value="">Sélectionnez une épreuve</option>
                    {epreuveOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Epreuve (if "autre" is selected for CSO) */}
              {formData.competitionType === "CSO" &&
                formData.epreuve === "autre" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Spécifiez l'épreuve *
                    </label>
                    <input
                      type="text"
                      name="epreuveCustom"
                      value={formData.epreuveCustom}
                      onChange={handleInputChange}
                      placeholder="Nom de l'épreuve"
                      className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                      required
                    />
                  </div>
                )}

              {/* Performance Indicator */}
              {formData.competitionType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getPerformanceIndicatorLabel()}
                  </label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder={getPerformanceIndicatorPlaceholder()}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                </div>
              )}

              {/* Résultats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Résultats
                </label>
                <input
                  type="text"
                  name="result"
                  value={formData.result}
                  onChange={handleInputChange}
                  placeholder="Position / Résultat"
                  className="w-full px-4 py-3 rounded-xl text-black border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                />
              </div>

              {/* Cavalier */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cavalier *
                </label>
                <input
                  type="text"
                  name="rider"
                  value={formData.rider}
                  onChange={handleInputChange}
                  placeholder="Nom du cavalier"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between">
            <Link
              href="/options/palmares"
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-[#1B4D3E] text-white rounded-xl hover:bg-[#153729] transition-colors duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Mise à jour..." : "Mettre à jour la Performance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UpdatePerformance() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        </div>
      }
    >
      <UpdatePerformanceForm />
    </Suspense>
  );
}
