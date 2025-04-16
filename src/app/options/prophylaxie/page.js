"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Search,
  ChevronRight,
  Stethoscope,
  Pill,
  Leaf,
  Scissors,
  Clock,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Loading fallback component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B4D3E]"></div>
    </div>
  );
}

// Main content component
function ProphylaxieSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [horses, setHorses] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // For custom type entry when "Autre" is selected
  const [customTypeValue, setCustomTypeValue] = useState("");
  const [customTypeError, setCustomTypeError] = useState("");

  // Handle pre-selected horse from URL
  useEffect(() => {
    const selectedHorseParam = searchParams.get("selectedHorse");
    if (selectedHorseParam) {
      try {
        const horse = JSON.parse(decodeURIComponent(selectedHorseParam));
        setSelectedHorse(horse);
        setHorses([horse]);
        setSearchQuery(horse.name);
      } catch (error) {
        console.error("Error parsing selected horse:", error);
      }
    }
  }, [searchParams]);

  // Prophylaxie types
  const prophylaxieTypes = [
    {
      id: "vaccination",
      name: "Vaccination",
      description: "Vaccins et rappels",
      icon: <Pill className="w-5 h-5" />,
    },
    {
      id: "vermifugation",
      name: "Vermifugation",
      description: "Traitements vermifuges",
      icon: <Leaf className="w-5 h-5" />,
    },
    {
      id: "soins-dentaires",
      name: "Soins dentaires",
      description: "Interventions et contrôles dentaires",
      icon: <Scissors className="w-5 h-5" />,
    },
    {
      id: "autre",
      name: "Autre",
      description: "Autres types de soins préventifs",
      icon: <Clock className="w-5 h-5" />,
      hasCustomEntry: true,
    },
  ];

  const searchHorses = async (searchText) => {
    // Skip API call if we have a pre-selected horse
    if (selectedHorse) return;

    try {
      setIsSearching(true);
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

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setHorses(data.data || []);
    } catch (error) {
      console.error("Error searching horses:", error);
      setHorses([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInput = async (e) => {
    const searchText = e.target.value;
    setSearchQuery(searchText);

    // Clear pre-selected horse if user starts searching
    if (selectedHorse && searchText !== selectedHorse.name) {
      setSelectedHorse(null);
    }

    if (searchText.length >= 2) {
      await searchHorses(searchText);
    } else {
      setHorses([]);
    }
  };

  const handleSelectType = (type) => {
    setSelectedType(type);

    // Reset custom type value and error when switching types
    if (type.id !== "autre") {
      setCustomTypeValue("");
      setCustomTypeError("");
    }
  };

  const canProceed =
    selectedHorse &&
    selectedType &&
    (selectedType.id !== "autre" ||
      (selectedType.id === "autre" && customTypeValue.trim() !== ""));

  const handleProceed = () => {
    if (!canProceed) {
      // Show error if trying to proceed with "Autre" selected but no custom type entered
      if (selectedType?.id === "autre" && customTypeValue.trim() === "") {
        setCustomTypeError("Veuillez spécifier le type de soin préventif");
        return;
      }
      return;
    }

    const queryParams = new URLSearchParams({
      horseId: selectedHorse._id,
      horseName: selectedHorse.name,
      horseMatricule: selectedHorse.matricule || "",
      race: selectedHorse.race || "",
      discipline: selectedHorse.discipline || "",
      birthDate: selectedHorse.birthDate || "",
      newid: selectedHorse.horseId || "",
    });

    // For "Autre" type, use the custom value as the prophylaxie type
    if (selectedType.id === "autre") {
      queryParams.append("prophylaxieType", "Autre");
      queryParams.append("customType", customTypeValue.trim());
    } else {
      queryParams.append("prophylaxieType", selectedType.name);
    }

    queryParams.append("prophylaxieId", selectedType.id);

    router.push(`/options/prophylaxie/form?${queryParams}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6 tracking-tight">
            Nouvelle prophylaxie
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">
            Sélectionnez un cheval et un type de soin préventif
          </p>
        </div>

        <div className="space-y-8">
          {/* Horse Selection Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6 flex items-center">
              <span className="bg-[#1B4D3E]/10 rounded-lg p-2 mr-3">
                <Search className="w-5 h-5 text-[#1B4D3E]" />
              </span>
              Sélection du Cheval
            </h2>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un cheval par nom ou matricule..."
                className="w-full pl-12 text-black pr-4 py-3 rounded-xl border border-gray-200 
                         focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                         outline-none transition-all bg-white/50"
                value={searchQuery}
                onChange={handleSearchInput}
              />
            </div>

            <div className="space-y-3">
              {horses.length > 0 ? (
                horses.map((horse) => (
                  <div
                    key={horse._id}
                    onClick={() => setSelectedHorse(horse)}
                    className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] 
                              border-2 ${
                                selectedHorse?._id === horse._id
                                  ? "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white border-transparent"
                                  : "bg-white hover:bg-gray-50 border-gray-100"
                              }`}
                  >
                    <div className="font-medium">{horse.name}</div>
                    <div
                      className={`text-sm ${
                        selectedHorse?._id === horse._id
                          ? "text-white/80"
                          : "text-gray-600"
                      }`}
                    >
                      {horse.matricule
                        ? `Matricule: ${horse.matricule}`
                        : "Matricule non disponible"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  {searchQuery.length >= 2 ? (
                    <div className="text-gray-500">
                      {isSearching ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4D3E]"></div>
                        </div>
                      ) : (
                        "Aucun cheval trouvé"
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      Commencez à taper pour rechercher un cheval
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Prophylaxie Type Selection Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Type de prophylaxie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prophylaxieTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleSelectType(type)}
                  className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] 
                            border-2 ${
                              selectedType?.id === type.id
                                ? "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white border-transparent"
                                : "bg-white hover:bg-gray-50 border-gray-100"
                            }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedType?.id === type.id
                          ? "bg-white/20"
                          : "bg-[#1B4D3E]/10"
                      }`}
                    >
                      {type.icon}
                    </div>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div
                        className={`text-sm ${
                          selectedType?.id === type.id
                            ? "text-white/80"
                            : "text-gray-600"
                        }`}
                      >
                        {type.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom type input field when "Autre" is selected */}
            {selectedType?.id === "autre" && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Précisez le type de soin préventif
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customTypeValue}
                    onChange={(e) => {
                      setCustomTypeValue(e.target.value);
                      setCustomTypeError("");
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-black 
                             focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                             outline-none transition-all bg-white/50
                             ${
                               customTypeError
                                 ? "border-red-500"
                                 : "border-gray-200"
                             }`}
                    placeholder="Ex: Soins des sabots, Examen ophtalmologique, etc."
                  />
                  {customTypeError && (
                    <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{customTypeError}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Proceed Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleProceed}
              disabled={!canProceed}
              className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 
                        transition-all transform hover:scale-[1.02] ${
                          canProceed
                            ? "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
            >
              Continuer
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function ProphylaxieSelection() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProphylaxieSelectionContent />
    </Suspense>
  );
}
