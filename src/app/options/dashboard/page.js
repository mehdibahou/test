"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDashboard } from "@/app/context/DashboardContext";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  CircleUser,
  Activity,
  Heart,
  Check,
  BarChart3,
  AlertCircle,
  Plus,
  FileText,
  RefreshCw,
  Filter,
  ChevronDown,
  Download,
  Search,
  SlidersHorizontal,
  XIcon,
} from "lucide-react";

// Color palettes
const COLORS = ["#1B4D3E", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"];
const ROBE_COLORS = {
  Alezan: "#8B4513", // Saddle brown
  Aksan: "#DEB887", // Burlywood
  Noir: "#2F2F2F", // Almost black
  Bai: "#654321", // Dark brown
  Isabelle: "#F4A460", // Sandy brown
  "Bai brun": "#5C4033", // Medium brown
  "Alezan brûlé": "#800000", // Maroon
  Palomino: "#FFD700", // Gold
  Gris: "#808080", // Gray
  Blanc: "#F5F5F5", // White smoke
};
const DISCIPLINE_COLORS = ["#1B4D3E", "#2A9D8F", "#264653"];
const PATHOLOGIE_COLORS = ["#E63946", "#F4A261", "#457B9D"];
const AGE_COLORS = [
  "#1B4D3E",
  "#2A9D8F",
  "#E9C46A",
  "#F4A261",
  "#E76F51",
  "#264653",
  "#457B9D",
];

export default function Dashboard() {
  const router = useRouter();
  const { state, fetchDashboardData, setTimeRange } = useDashboard();
  const { loading, error, stats, chartData } = state;
  const dashboardRef = useRef(null);

  const [filters, setFilters] = useState({
    race: "",
    robe: "",
    etat: "",
    discipline: "",
    ageRange: "",
    sex: "",
  });

  const [showFilters, setShowFilters] = useState(true);
  const [downloadingChart, setDownloadingChart] = useState(null);

  // Chart refs for downloading
  const chartRefs = {
    disciplineChart: useRef(null),
    ecasSubcategoriesChart: useRef(null),
    raceChart: useRef(null),
    pathologiesChart: useRef(null),
    ageByDisciplineChart: useRef(null),
    robeByDisciplineChart: useRef(null),
    raceByDisciplineChart: useRef(null),
  };

  // Calculate age ranges for age filter
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

  // Function to determine if a discipline is an E.C.A.S discipline
  const isECASDiscipline = (discipline) => {
    return discipline && discipline.startsWith("E.C.A.S");
  };

  // Function to get the E.C.A.S subcategory
  const getECASSubcategory = (discipline) => {
    if (!isECASDiscipline(discipline)) return null;
    const parts = discipline.split("-");
    return parts.length > 1 ? parts[1].trim() : "Autre";
  };

  // Prepare filtered data
  const filteredData = useMemo(() => {
    if (!chartData?.rawData?.length) return { horses: [] };

    let filtered = [...chartData.rawData];

    // Apply filters
    if (filters.race) {
      filtered = filtered.filter((horse) => horse.race === filters.race);
    }

    if (filters.robe) {
      filtered = filtered.filter((horse) => horse.robe === filters.robe);
    }

    if (filters.etat) {
      filtered = filtered.filter((horse) => horse.etat === filters.etat);
    }

    if (filters.discipline) {
      if (filters.discipline === "E.C.A.S") {
        filtered = filtered.filter((horse) =>
          isECASDiscipline(horse.discipline)
        );
      } else {
        filtered = filtered.filter(
          (horse) => horse.discipline === filters.discipline
        );
      }
    }

    if (filters.sex) {
      filtered = filtered.filter((horse) => horse.sex === filters.sex);
    }

    if (filters.ageRange) {
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
      }

      filtered = filtered.filter((horse) => {
        const age = calculateAge(horse.birthDate);
        return age >= min && age <= max;
      });
    }

    return { horses: filtered };
  }, [chartData?.rawData, filters]);

  // Prepare discipline distribution with E.C.A.S grouped together
  const disciplineDistribution = useMemo(() => {
    if (!filteredData.horses?.length) return [];

    const disciplines = {};

    filteredData.horses.forEach((horse) => {
      let disciplineKey = isECASDiscipline(horse.discipline)
        ? "E.C.A.S"
        : horse.discipline || "Non spécifié";

      if (!disciplines[disciplineKey]) {
        disciplines[disciplineKey] = 0;
      }
      disciplines[disciplineKey]++;
    });

    return Object.entries(disciplines).map(([key, value]) => ({
      name: key,
      value,
    }));
  }, [filteredData]);

  // Prepare E.C.A.S subcategories
  const ecasSubcategories = useMemo(() => {
    if (!filteredData.horses?.length) return [];

    const ecasHorses = filteredData.horses.filter((horse) =>
      isECASDiscipline(horse.discipline)
    );
    const subcategories = {};

    ecasHorses.forEach((horse) => {
      const subcategory = getECASSubcategory(horse.discipline) || "Autre";

      if (!subcategories[subcategory]) {
        subcategories[subcategory] = 0;
      }
      subcategories[subcategory]++;
    });

    return Object.entries(subcategories).map(([key, value]) => ({
      name: key,
      value,
    }));
  }, [filteredData]);

  // Prepare race distribution
  const raceDistribution = useMemo(() => {
    if (!filteredData.horses?.length) return [];

    const races = {};

    filteredData.horses.forEach((horse) => {
      const race = horse.race || "Non spécifié";

      if (!races[race]) {
        races[race] = 0;
      }
      races[race]++;
    });

    return Object.entries(races)
      .map(([key, value]) => ({
        name: key,
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Original age by discipline distribution (unused after modification)
  const ageByDiscipline = useMemo(() => {
    if (!filteredData.horses?.length) return [];

    const ageRanges = {
      "0-4": { label: "0-4 ans", min: 0, max: 4 },
      "5-7": { label: "5-7 ans", min: 5, max: 7 },
      "8-12": { label: "8-12 ans", min: 8, max: 12 },
      "13-15": { label: "13-15 ans", min: 13, max: 15 },
      "16-18": { label: "16-18 ans", min: 16, max: 18 },
      "19+": { label: "19+ ans", min: 19, max: 100 },
    };

    const disciplineAgeMap = {};

    filteredData.horses.forEach((horse) => {
      let disciplineKey = isECASDiscipline(horse.discipline)
        ? "E.C.A.S"
        : horse.discipline || "Non spécifié";
      const age = calculateAge(horse.birthDate);

      let ageRange =
        Object.keys(ageRanges).find((range) => {
          const { min, max } = ageRanges[range];
          return age >= min && age <= max;
        }) || "19+";

      if (!disciplineAgeMap[disciplineKey]) {
        disciplineAgeMap[disciplineKey] = {};
        Object.keys(ageRanges).forEach((range) => {
          disciplineAgeMap[disciplineKey][range] = 0;
        });
      }

      disciplineAgeMap[disciplineKey][ageRange]++;
    });

    // Convert to format needed for stacked bar chart
    return Object.entries(disciplineAgeMap).map(([discipline, ages]) => {
      const result = { discipline };

      Object.entries(ages).forEach(([range, count]) => {
        // Only add non-zero counts
        if (count > 0) {
          result[range] = count;
        }
      });

      return result;
    });
  }, [filteredData]);

  // NEW: Prepare age distribution with ages on X-axis
  const ageByDisciplineReversed = useMemo(() => {
    if (!filteredData.horses?.length) return [];

    const ageRanges = {
      "0-4": { label: "0-4 ans", min: 0, max: 4 },
      "5-7": { label: "5-7 ans", min: 5, max: 7 },
      "8-12": { label: "8-12 ans", min: 8, max: 12 },
      "13-15": { label: "13-15 ans", min: 13, max: 15 },
      "16-18": { label: "16-18 ans", min: 16, max: 18 },
      "19+": { label: "19+ ans", min: 19, max: 100 },
    };

    // Get all disciplines in filtered data
    const allDisciplines = Array.from(
      new Set(
        filteredData.horses.map((horse) =>
          isECASDiscipline(horse.discipline)
            ? "E.C.A.S"
            : horse.discipline || "Non spécifié"
        )
      )
    );

    // Initialize data structure with age ranges as keys
    const ageRangeMap = {};
    Object.keys(ageRanges).forEach((range) => {
      ageRangeMap[range] = {};
      allDisciplines.forEach((discipline) => {
        ageRangeMap[range][discipline] = 0;
      });
    });

    // Populate data
    filteredData.horses.forEach((horse) => {
      let disciplineKey = isECASDiscipline(horse.discipline)
        ? "E.C.A.S"
        : horse.discipline || "Non spécifié";
      const age = calculateAge(horse.birthDate);

      let ageRange =
        Object.keys(ageRanges).find((range) => {
          const { min, max } = ageRanges[range];
          return age >= min && age <= max;
        }) || "19+";

      ageRangeMap[ageRange][disciplineKey]++;
    });

    // Convert to format needed for stacked bar chart
    return Object.entries(ageRangeMap).map(([ageRange, disciplines]) => {
      const result = { ageRange };

      Object.entries(disciplines).forEach(([discipline, count]) => {
        // Only add non-zero counts
        if (count > 0) {
          result[discipline] = count;
        }
      });

      return result;
    });
  }, [filteredData]);

  // Prepare robe by discipline
  const robeByDiscipline = useMemo(() => {
    if (!filteredData.horses?.length) return [];

    const disciplineRobeMap = {};

    filteredData.horses.forEach((horse) => {
      let disciplineKey = isECASDiscipline(horse.discipline)
        ? "E.C.A.S"
        : horse.discipline || "Non spécifié";
      const robe = horse.robe || "Non spécifié";

      if (!disciplineRobeMap[disciplineKey]) {
        disciplineRobeMap[disciplineKey] = {};
      }

      if (!disciplineRobeMap[disciplineKey][robe]) {
        disciplineRobeMap[disciplineKey][robe] = 0;
      }

      disciplineRobeMap[disciplineKey][robe]++;
    });

    // Get all unique robes
    const allRobes = Array.from(
      new Set(filteredData.horses.map((horse) => horse.robe || "Non spécifié"))
    );

    // Convert to format needed for stacked bar chart
    return Object.entries(disciplineRobeMap).map(([discipline, robes]) => {
      const result = { discipline };

      allRobes.forEach((robe) => {
        // Only add non-zero counts
        const count = robes[robe] || 0;
        if (count > 0) {
          result[robe] = count;
        }
      });

      return result;
    });
  }, [filteredData]);

  // Prepare race by discipline
  const raceByDiscipline = useMemo(() => {
    if (!filteredData.horses?.length) return [];

    const disciplineRaceMap = {};

    filteredData.horses.forEach((horse) => {
      let disciplineKey = isECASDiscipline(horse.discipline)
        ? "E.C.A.S"
        : horse.discipline || "Non spécifié";
      const race = horse.race || "Non spécifié";

      if (!disciplineRaceMap[disciplineKey]) {
        disciplineRaceMap[disciplineKey] = {};
      }

      if (!disciplineRaceMap[disciplineKey][race]) {
        disciplineRaceMap[disciplineKey][race] = 0;
      }

      disciplineRaceMap[disciplineKey][race]++;
    });

    // Get top races to avoid too many categories
    const allRaces = Array.from(
      new Set(filteredData.horses.map((horse) => horse.race || "Non spécifié"))
    );
    const topRaces = [...allRaces]
      .sort((a, b) => {
        const countA = filteredData.horses.filter((h) => h.race === a).length;
        const countB = filteredData.horses.filter((h) => h.race === b).length;
        return countB - countA;
      })
      .slice(0, 5); // Take top 5 races

    // Convert to format needed for stacked bar chart
    return Object.entries(disciplineRaceMap).map(([discipline, races]) => {
      const result = { discipline };

      // Add top races, but only if count > 0
      topRaces.forEach((race) => {
        const count = races[race] || 0;
        if (count > 0) {
          result[race] = count;
        }
      });

      // Add "Autres" category for remaining races
      const otherRaces = Object.entries(races)
        .filter(([race]) => !topRaces.includes(race))
        .reduce((sum, [_, count]) => sum + count, 0);

      if (otherRaces > 0) {
        result["Autres"] = otherRaces;
      }

      return result;
    });
  }, [filteredData]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const clearFilters = () => {
    setFilters({
      race: "",
      robe: "",
      etat: "",
      discipline: "",
      ageRange: "",
      sex: "",
    });
  };

  // Download chart as image
  const downloadChart = async (chartRef, chartName) => {
    if (!chartRef.current) {
      alert("Impossible de capturer le graphique");
      return;
    }

    setDownloadingChart(chartName);

    try {
      const chartElement = chartRef.current;

      // Create a canvas from the chart
      const canvas = await html2canvas(chartElement, {
        scale: 2, // Higher resolution
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Convert canvas to image
      const image = canvas.toDataURL("image/png");

      // Create download link
      const link = document.createElement("a");
      link.href = image;
      link.download = `${chartName}_${
        new Date().toISOString().split("T")[0]
      }.png`;
      link.click();
    } catch (error) {
      console.error("Error downloading chart:", error);
      alert("Erreur lors du téléchargement du graphique");
    } finally {
      setDownloadingChart(null);
    }
  };

  // Create custom tooltip components for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-600">
            {`Nombre : ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const StackedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Filter out zero values
      const nonZeroPayload = payload.filter((entry) => entry.value > 0);

      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            {label === "ageRange"
              ? `Âge: ${label}`
              : label === "discipline"
              ? `Position: ${label}`
              : `${label}`}
          </p>
          {nonZeroPayload.map((entry, index) => (
            <p
              key={`tooltip-${index}`}
              className="text-sm text-gray-600"
              style={{ color: entry.color }}
            >
              {`${entry.name}: ${entry.value} chevaux`}
            </p>
          ))}
          <p className="text-sm font-medium text-gray-700 mt-1">
            {`Total: ${nonZeroPayload.reduce(
              (sum, entry) => sum + entry.value,
              0
            )} chevaux`}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleCardClick = (category, filterValue) => {
    // Check if there's data to show
    if (category === "all" && !stats.totalHorses) return;
    if (category !== "all" && !stats[category]) return;

    setFilters((prev) => ({
      ...prev,
      etat: filterValue,
    }));
  };

  const handleChartClick = (data, category) => {
    if (!data || !data.name) return;

    // Set the appropriate filter based on the chart click
    switch (category) {
      case "race":
        setFilters((prev) => ({ ...prev, race: data.name }));
        break;
      case "robe":
        setFilters((prev) => ({ ...prev, robe: data.name }));
        break;
      case "discipline":
        setFilters((prev) => ({ ...prev, discipline: data.name }));
        break;
      default:
        return;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#1B4D3E]"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Chargement des données...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-lg w-full">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Erreur de chargement
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
              <br />
              <span className="text-sm opacity-75">
                Veuillez réessayer ultérieurement
              </span>
            </p>
            <button
              onClick={() => fetchDashboardData()}
              className="px-6 py-2 bg-[#1B4D3E] text-white rounded-xl hover:bg-[#153729] transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (
    !stats.totalHorses &&
    !Object.values(chartData).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    )
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
          <FileText className="h-16 w-16 text-[#1B4D3E] mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Aucune donnée disponible
          </h2>
          <p className="text-gray-600 mb-6">
            Il semble qu'il n'y ait pas encore de données à afficher. Commencez
            par ajouter des chevaux et des examens pour voir les statistiques
            apparaître ici.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/options/newhorse")}
              className="px-4 py-2 bg-[#1B4D3E] text-white rounded-xl hover:bg-[#153729] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ajouter un cheval
            </button>
            <button
              onClick={() => router.push("/options/choix")}
              className="px-4 py-2 border border-[#1B4D3E] text-[#1B4D3E] rounded-xl hover:bg-[#1B4D3E] hover:text-white transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Nouvel examen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50"
      ref={dashboardRef}
    >
      <div className="mx-10 px-6 py-8">
        {/* Header with title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1B4D3E]">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble et statistiques des chevaux
          </p>
        </div>

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
              {/* État Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État de santé
                </label>
                <select
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  value={filters.etat}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, etat: e.target.value }))
                  }
                >
                  <option value="">Tous les états</option>
                  <option value="sain">Sain</option>
                  <option value="malade">Malade</option>
                  <option value="en rétablissement">En rétablissement</option>
                </select>
              </div>

              {/* Race Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Race
                </label>
                <select
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  value={filters.race}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, race: e.target.value }))
                  }
                >
                  <option value="">Toutes les races</option>
                  {Array.from(
                    new Set(chartData?.rawData?.map((horse) => horse.race))
                  )
                    .filter(Boolean)
                    .sort()
                    .map((race) => (
                      <option key={race} value={race}>
                        {race}
                      </option>
                    ))}
                </select>
              </div>

              {/* Robe Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robe
                </label>
                <select
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  value={filters.robe}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, robe: e.target.value }))
                  }
                >
                  <option value="">Toutes les robes</option>
                  {Array.from(
                    new Set(chartData?.rawData?.map((horse) => horse.robe))
                  )
                    .filter(Boolean)
                    .sort()
                    .map((robe) => (
                      <option key={robe} value={robe}>
                        {robe}
                      </option>
                    ))}
                </select>
              </div>

              {/* Discipline Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  value={filters.discipline}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      discipline: e.target.value,
                    }))
                  }
                >
                  <option value="">Toutes les position</option>
                  <option value="E.C.A.S">E.C.A.S (toutes)</option>
                  {Array.from(
                    new Set(
                      chartData?.rawData?.map((horse) =>
                        isECASDiscipline(horse.discipline)
                          ? null
                          : horse.discipline
                      )
                    )
                  )
                    .filter(Boolean)
                    .sort()
                    .map((discipline) => (
                      <option key={discipline} value={discipline}>
                        {discipline}
                      </option>
                    ))}
                </select>
              </div>

              {/* Age Range Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Âge
                </label>
                <select
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  value={filters.ageRange}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: e.target.value,
                    }))
                  }
                >
                  <option value="">Tous les âges</option>
                  <option value="0-4">0-4 ans</option>
                  <option value="5-7">5-7 ans</option>
                  <option value="8-12">8-12 ans</option>
                  <option value="13-15">13-15 ans</option>
                  <option value="16-18">16-18 ans</option>
                  <option value="18-20">18-20 ans</option>
                  <option value=">20">Plus de 20 ans</option>
                </select>
              </div>

              {/* Sex Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexe
                </label>
                <select
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  value={filters.sex}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sex: e.target.value }))
                  }
                >
                  <option value="">Tous les sexes</option>
                  {Array.from(
                    new Set(chartData?.rawData?.map((horse) => horse.sex))
                  )
                    .filter(Boolean)
                    .sort()
                    .map((sex) => (
                      <option key={sex} value={sex}>
                        {sex}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 kpi-cards">
          {[
            {
              title: "Total Chevaux",
              value: filteredData.horses.length || "0",
              icon: CircleUser,
              color: "from-[#1B4D3E] to-[#2A9D8F]",
              category: "all",
              filterValue: "", // no filter for all
            },
            {
              title: "Malades",
              value:
                filteredData.horses.filter((h) => h.etat === "malade").length ||
                "0",
              icon: Activity,
              color: "from-amber-500 to-orange-600",
              category: "maladies",
              filterValue: "malade",
            },
            {
              title: "En Rétablissement",
              value:
                filteredData.horses.filter(
                  (h) => h.etat === "en rétablissement"
                ).length || "0",
              icon: Heart,
              color: "from-blue-500 to-blue-600",
              category: "retablissement",
              filterValue: "en rétablissement",
            },
            {
              title: "Sains",
              value:
                filteredData.horses.filter((h) => h.etat === "sain").length ||
                "0",
              icon: Check,
              color: "from-emerald-500 to-emerald-600",
              category: "sains",
              filterValue: "sain",
            },
          ].map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.category, card.filterValue)}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer ${
                !card.value || card.value === "0" ? "opacity-75" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-800">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${card.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Discipline Distribution with E.C.A.S grouped */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 chart-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Répartition par Position
                </h3>
                <p className="text-sm text-gray-500">
                  Distribution des Position
                </p>
              </div>
              <button
                onClick={() =>
                  downloadChart(chartRefs.disciplineChart, "disciplines")
                }
                disabled={downloadingChart === "disciplines"}
                className="p-2 text-[#1B4D3E] hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger en PNG"
              >
                {downloadingChart === "disciplines" ? (
                  <div className="w-5 h-5 border-t-2 border-[#1B4D3E] rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
            <div ref={chartRefs.disciplineChart}>
              {disciplineDistribution.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={disciplineDistribution}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 50, // Increased left margin for labels
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ angle: -45, textAnchor: "end" }}
                        height={70}
                      />
                      <YAxis
                        tickCount={10} // Increase number of ticks
                        allowDecimals={false} // No decimal values for count
                        domain={[0, "dataMax + 1"]} // Add some padding at the top
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        onClick={(data) => handleChartClick(data, "discipline")}
                        cursor="pointer"
                      >
                        {disciplineDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              DISCIPLINE_COLORS[
                                index % DISCIPLINE_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 empty-chart-placeholder">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aucune donnée sur les disciplines
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                    Ajoutez des chevaux pour voir la distribution des
                    disciplines apparaître ici.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* E.C.A.S Subcategories */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 chart-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Répartition des Catégories
                </h3>
                <p className="text-sm text-gray-500">
                  Distribution des disciplines
                </p>
              </div>
              <button
                onClick={() =>
                  downloadChart(
                    chartRefs.ecasSubcategoriesChart,
                    "ecas_subcategories"
                  )
                }
                disabled={downloadingChart === "ecas_subcategories"}
                className="p-2 text-[#1B4D3E] hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger en PNG"
              >
                {downloadingChart === "ecas_subcategories" ? (
                  <div className="w-5 h-5 border-t-2 border-[#1B4D3E] rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
            <div ref={chartRefs.ecasSubcategoriesChart}>
              {ecasSubcategories.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={{
                        top: 5,
                        right: 30,
                        left: 30, // Increased for better spacing
                        bottom: 5,
                      }}
                    >
                      <Pie
                        data={ecasSubcategories}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {ecasSubcategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 empty-chart-placeholder">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aucune donnée sur les sous-catégories E.C.A.S
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                    Ajoutez des chevaux de discipline E.C.A.S pour voir cette
                    répartition.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Race Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 chart-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Répartition par Race
                </h3>
                <p className="text-sm text-gray-500">Distribution des races</p>
              </div>
              <button
                onClick={() => downloadChart(chartRefs.raceChart, "races")}
                disabled={downloadingChart === "races"}
                className="p-2 text-[#1B4D3E] hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger en PNG"
              >
                {downloadingChart === "races" ? (
                  <div className="w-5 h-5 border-t-2 border-[#1B4D3E] rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
            <div ref={chartRefs.raceChart}>
              {raceDistribution.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={raceDistribution}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 50, // Increased for Y-axis labels
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ angle: -45, textAnchor: "end" }}
                        height={70}
                      />
                      <YAxis
                        tickCount={10}
                        allowDecimals={false}
                        domain={[0, "dataMax + 1"]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="value"
                        onClick={(data) => handleChartClick(data, "race")}
                        cursor="pointer"
                      >
                        {raceDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 empty-chart-placeholder">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aucune donnée sur les races
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                    Ajoutez des chevaux pour voir la distribution des races
                    apparaître ici.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pathologies Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 chart-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Distribution des motifs de consultation
                </h3>
                <p className="text-sm text-gray-500">
                  Distribution des cas médicaux
                </p>
              </div>
              <button
                onClick={() =>
                  downloadChart(chartRefs.pathologiesChart, "pathologies")
                }
                disabled={downloadingChart === "pathologies"}
                className="p-2 text-[#1B4D3E] hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger en PNG"
              >
                {downloadingChart === "pathologies" ? (
                  <div className="w-5 h-5 border-t-2 border-[#1B4D3E] rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
            <div ref={chartRefs.pathologiesChart}>
              {chartData?.pathologies?.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={{
                        top: 5,
                        right: 30,
                        left: 30,
                        bottom: 5,
                      }}
                    >
                      <Pie
                        data={chartData.pathologies.map((item) => ({
                          name: item._id,
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.pathologies.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              PATHOLOGIE_COLORS[
                                index % PATHOLOGIE_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 empty-chart-placeholder">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aucune donnée sur les pathologies
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                    Les statistiques sur les pathologies apparaîtront ici une
                    fois que des examens seront enregistrés.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Age by Discipline - MODIFIED to have ages on X-axis */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 chart-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Répartition des Âges par Position
                </h3>
                <p className="text-sm text-gray-500">
                  Analyse de l'âge des chevaux par position
                </p>
              </div>
              <button
                onClick={() =>
                  downloadChart(
                    chartRefs.ageByDisciplineChart,
                    "ages_par_discipline"
                  )
                }
                disabled={downloadingChart === "ages_par_discipline"}
                className="p-2 text-[#1B4D3E] hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger en PNG"
              >
                {downloadingChart === "ages_par_discipline" ? (
                  <div className="w-5 h-5 border-t-2 border-[#1B4D3E] rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
            <div ref={chartRefs.ageByDisciplineChart}>
              {ageByDisciplineReversed.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ageByDisciplineReversed}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 50,
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="ageRange"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        tickCount={10}
                        allowDecimals={false}
                        domain={[0, "dataMax + 1"]}
                      />
                      <Tooltip content={<StackedTooltip />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="top"
                        align="center"
                        wrapperStyle={{ paddingBottom: "20px" }}
                      />
                      {Array.from(
                        new Set(
                          filteredData.horses.map((horse) =>
                            isECASDiscipline(horse.discipline)
                              ? "E.C.A.S"
                              : horse.discipline || "Non spécifié"
                          )
                        )
                      ).map((discipline, index) => (
                        <Bar
                          key={`discipline-${discipline}`}
                          dataKey={discipline}
                          stackId="a"
                          fill={
                            DISCIPLINE_COLORS[index % DISCIPLINE_COLORS.length]
                          }
                          name={discipline}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 empty-chart-placeholder">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aucune donnée disponible
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                    Ajoutez des chevaux avec leur âge et discipline pour
                    visualiser cette distribution.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Robe by Discipline */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 chart-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Distribution des Robes par Position
                </h3>
                <p className="text-sm text-gray-500">
                  Analyse des robes par Position
                </p>
              </div>
              <button
                onClick={() =>
                  downloadChart(
                    chartRefs.robeByDisciplineChart,
                    "robes_par_discipline"
                  )
                }
                disabled={downloadingChart === "robes_par_discipline"}
                className="p-2 text-[#1B4D3E] hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger en PNG"
              >
                {downloadingChart === "robes_par_discipline" ? (
                  <div className="w-5 h-5 border-t-2 border-[#1B4D3E] rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
            <div ref={chartRefs.robeByDisciplineChart}>
              {robeByDiscipline.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={robeByDiscipline}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 50, // Increased for Y-axis labels
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="discipline"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        tickCount={10}
                        allowDecimals={false}
                        domain={[0, "dataMax + 1"]}
                      />
                      <Tooltip content={<StackedTooltip />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="top"
                        align="center"
                        wrapperStyle={{ paddingBottom: "20px" }}
                      />
                      {Array.from(
                        new Set(
                          filteredData.horses.map(
                            (horse) => horse.robe || "Non spécifié"
                          )
                        )
                      )
                        .filter(Boolean)
                        .map((robe, index) => (
                          <Bar
                            key={`robe-${robe}`}
                            dataKey={robe}
                            stackId="a"
                            fill={
                              ROBE_COLORS[robe] || COLORS[index % COLORS.length]
                            }
                            name={robe}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 empty-chart-placeholder">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aucune donnée disponible
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                    Ajoutez des chevaux avec leurs disciplines et robes pour
                    visualiser cette distribution.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Race by Discipline */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 chart-section">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Distribution des Races par Discipline
                </h3>
                <p className="text-sm text-gray-500">
                  Analyse des races par type d'activité
                </p>
              </div>
              <button
                onClick={() =>
                  downloadChart(
                    chartRefs.raceByDisciplineChart,
                    "races_par_discipline"
                  )
                }
                disabled={downloadingChart === "races_par_discipline"}
                className="p-2 text-[#1B4D3E] hover:bg-gray-100 rounded-lg transition-colors"
                title="Télécharger en PNG"
              >
                {downloadingChart === "races_par_discipline" ? (
                  <div className="w-5 h-5 border-t-2 border-[#1B4D3E] rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>
            <div ref={chartRefs.raceByDisciplineChart}>
              {raceByDiscipline.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={raceByDiscipline}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 50, // Increased for Y-axis labels
                        bottom: 70,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="discipline"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        tickCount={10}
                        allowDecimals={false}
                        domain={[0, "dataMax + 1"]}
                      />
                      <Tooltip content={<StackedTooltip />} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="top"
                        align="center"
                        wrapperStyle={{ paddingBottom: "20px" }}
                      />
                      {Array.from(
                        new Set([
                          ...raceByDiscipline.flatMap((item) =>
                            Object.keys(item).filter(
                              (key) => key !== "discipline"
                            )
                          ),
                        ])
                      )
                        .filter(Boolean)
                        .map((race, index) => (
                          <Bar
                            key={`race-${race}`}
                            dataKey={race}
                            stackId="a"
                            fill={COLORS[index % COLORS.length]}
                            name={race}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 empty-chart-placeholder">
                  <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Aucune donnée disponible
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm mt-2">
                    Ajoutez des chevaux avec leurs disciplines et races pour
                    visualiser cette distribution.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
