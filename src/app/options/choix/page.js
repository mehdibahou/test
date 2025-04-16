"use client";
import React, { useState, useEffect, Suspense } from "react";
import {
  Search,
  ChevronRight,
  Stethoscope,
  Activity,
  Heart,
  Plus,
  BriefcaseMedical,
  HeartPulse,
  BriefcaseMedicalIcon,
  Eye,
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
function TestSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [horses, setHorses] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingCustomTest, setIsAddingCustomTest] = useState(false);
  const [customTestName, setCustomTestName] = useState("");
  const [customTestDescription, setCustomTestDescription] = useState("");

  console.log(horses, "horsesgggggg");
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

  const [tests, setTests] = useState([
    {
      id: 1,
      name: "Coliques",
      description: "Examen de la douleur abdominale",
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      id: 2,
      name: "Locomoteur",
      description: "Examen des boiteries et de la démarche",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: 3,
      name: "Dermatologie",
      description: "Examen de la peau et du pelage",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 4,
      name: "Blessures",
      description: "Évaluation des plaies et traumatismes",
      icon: <BriefcaseMedical className="w-5 h-5" />,
    },
    {
      id: 5,
      name: "Digestif",
      description: "Examen du transit et de la digestion",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 6,
      name: "Plaies",
      description: "Examen des Plaies",
      icon: <BriefcaseMedicalIcon className="w-5 h-5" />,
    },
    {
      id: 7,
      name: "Chirurgie",
      description: "Examen de Chirurgie",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 8,
      name: "Système nerveux",
      description: "Examen du Système nerveux",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 9,
      name: "Système cardiaque",
      description: "Examen du Système cardiaque",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 10,
      name: "Système respiratoire",
      description: "Examen du Système respiratoire",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      id: 11,
      name: "Ophtalmologie",
      description: "Examen d'Ophtalmologie",
      icon: <Eye className="w-5 h-5" />,
    },
  ]);

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

  const handleAddCustomTest = () => {
    if (!customTestName.trim()) return;

    const newTest = {
      id: `custom-${Date.now()}`,
      name: customTestName,
      description: customTestDescription || "Test personnalisé",
      icon: <Plus className="w-5 h-5" />,
      isCustom: true,
    };

    setTests((prevTests) => [...prevTests, newTest]);
    setSelectedTest(newTest);
    setIsAddingCustomTest(false);
    setCustomTestName("");
    setCustomTestDescription("");
  };

  const canProceed = selectedHorse && selectedTest;
  console.log(selectedHorse, "fghjk");
  const handleProceed = () => {
    if (!canProceed) return;

    const queryParams = new URLSearchParams({
      newid: selectedHorse.horseId,
      horseId: selectedHorse._id,
      horseName: selectedHorse.name,
      race: selectedHorse.race,
      discipline: selectedHorse.discipline,
      ...(selectedHorse.matricule && {
        horseMatricule: selectedHorse.matricule,
      }),
      ...(selectedHorse.birthDate && {
        datenaissance: selectedHorse.birthDate,
      }),
      testId: selectedTest.id,
      testName: selectedTest.name,
    }).toString();
    console.log(queryParams);
    router.push(`/options/consultation?${queryParams}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Enhanced Header */}
        <div className="mb-10 relative">
          <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6 tracking-tight">
            Nouvelle consultation
          </h1>
          <p className="text-gray-600 mt-3 text-lg font-medium">
            Sélectionnez un cheval et un motif de consultation
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

          {/* Test Selection Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Motif de consultation
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  onClick={() => setSelectedTest(test)}
                  className={`p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] 
                            border-2 ${
                              selectedTest?.id === test.id
                                ? "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white border-transparent"
                                : "bg-white hover:bg-gray-50 border-gray-100"
                            }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedTest?.id === test.id
                          ? "bg-white/20"
                          : "bg-[#1B4D3E]/10"
                      }`}
                    >
                      {test.icon}
                    </div>
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div
                        className={`text-sm ${
                          selectedTest?.id === test.id
                            ? "text-white/80"
                            : "text-gray-600"
                        }`}
                      >
                        {test.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Custom Test Button and Form */}
              {!isAddingCustomTest ? (
                <div
                  onClick={() => setIsAddingCustomTest(true)}
                  className="p-4 rounded-xl cursor-pointer transition-all transform hover:scale-[1.02] border-2 border-dashed border-gray-300 hover:border-[#1B4D3E] 
                            hover:bg-gray-50 flex items-center justify-center"
                >
                  <div className="flex items-center gap-2 text-gray-600 hover:text-[#1B4D3E]">
                    <Plus className="w-5 h-5" />
                    <span>Ajouter un test personnalisé</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border-2 border-gray-200 bg-white">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom du test
                      </label>
                      <input
                        type="text"
                        value={customTestName}
                        onChange={(e) => setCustomTestName(e.target.value)}
                        className="w-full px-4 text-black py-2 rounded-lg border border-gray-200 
                                 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
                        placeholder="Entrez le nom du test..."
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optionnelle)
                      </label>
                      <input
                        type="text"
                        value={customTestDescription}
                        onChange={(e) =>
                          setCustomTestDescription(e.target.value)
                        }
                        className="w-full px-4 text-black py-2 rounded-lg border border-gray-200 
                                 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1"
                        placeholder="Entrez une description..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setIsAddingCustomTest(false)}
                        className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleAddCustomTest}
                        disabled={!customTestName.trim()}
                        className={`px-4 py-2 rounded-lg ${
                          customTestName.trim()
                            ? "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              Procéder au Test
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function TestSelection() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TestSelectionContent />
    </Suspense>
  );
}
