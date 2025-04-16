"use client";
import React, { useState, useEffect, Suspense } from "react";
import { ArrowLeft, PencilIcon, ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function HorseDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("h");
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingState, setUpdatingState] = useState(false);

  useEffect(() => {
    const fetchHorseDetails = async () => {
      try {
        setLoading(true);
        const BASE_URL = "http://localhost:3001/api";
        const response = await fetch(`${BASE_URL}/horse/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch horse details");
        }

        const { data } = await response.json();
        setHorse(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching horse details:", err);
        setError("Erreur lors du chargement des détails");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHorseDetails();
    }
  }, [id]);

  const handleStateChange = async (newState) => {
    try {
      setUpdatingState(true);
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/horse/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ etat: newState }),
      });

      if (!response.ok) {
        throw new Error("Failed to update horse state");
      }

      const updatedHorse = await response.json();
      setHorse((prevHorse) => ({
        ...prevHorse,
        etat: updatedHorse.etat,
      }));
    } catch (error) {
      console.error("Error updating horse state:", error);
      setError("Erreur lors de la mise à jour de l'état");
    } finally {
      setUpdatingState(false);
    }
  };

  const renderParentInfo = (parentInfo, parentType) => {
    if (!parentInfo) {
      return <p className="mt-1 text-base text-gray-500">Non spécifié</p>;
    }

    return (
      <div className="mt-1">
        {parentInfo.name && (
          <p className="text-base text-gray-900">{parentInfo.name}</p>
        )}
        {parentInfo.matricule && (
          <p className="text-sm text-gray-500">
            Matricule: {parentInfo.matricule}
          </p>
        )}
      </div>
    );
  };

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

  if (error || !horse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-3xl mx-auto text-center py-12">
          <div className="bg-red-50 text-red-800 p-4 rounded-xl">
            {error || "Cheval non trouvé"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link
            href="/options/horses"
            className="flex items-center text-[#1B4D3E] hover:text-[#143932] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Retour à la liste
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>

          <div className="flex justify-between items-start mt-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1B4D3E]">
                {horse.name}
              </h1>
              <p className="text-gray-600 mt-2">Matricule: {horse.matricule}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Informations Générales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Date de naissance
                </h3>
                <p className="mt-1 text-base text-gray-900">
                  {new Date(horse.birthDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Race</h3>
                <p className="mt-1 text-base text-gray-900">
                  {horse.otherRace || horse.race}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Robe</h3>
                <p className="mt-1 text-base text-gray-900">
                  {horse.otherRobe || horse.robe}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Sexe</h3>
                <p className="mt-1 text-base text-gray-900">{horse.sex}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Discipline
                </h3>
                <p className="mt-1 text-base text-gray-900">
                  {horse.otherDiscipline || horse.discipline || "Non spécifié"}
                </p>
              </div>

              {/* État (State) dropdown */}
              <div>
                <h3 className="text-sm font-medium text-gray-500">État</h3>
                <div className="mt-1 relative">
                  <select
                    value={horse?.etat || "sain"}
                    onChange={(e) => handleStateChange(e.target.value)}
                    disabled={updatingState}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                    focus:outline-none text-black focus:ring-[#1B4D3E] focus:border-[#1B4D3E] rounded-md
                    ${
                      updatingState
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                    ${
                      horse?.etat === "malade"
                        ? "text-red-600 bg-red-50"
                        : horse?.etat === "en rétablissement"
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-green-600 bg-green-50"
                    }`}
                  >
                    <option value="sain" className="text-green-600 bg-white">
                      Sain
                    </option>
                    <option value="malade" className="text-red-600 bg-white">
                      Malade
                    </option>
                    <option
                      value="en rétablissement"
                      className="text-yellow-600 bg-white"
                    >
                      En rétablissement
                    </option>
                  </select>
                  {updatingState && (
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1B4D3E]"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Genealogy */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Généalogie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Père</h3>
                {renderParentInfo(horse.fatherInfo, "father")}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Mère</h3>
                {renderParentInfo(horse.motherInfo, "mother")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HorseDetails() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#1B4D3E]"></div>
            <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
          </div>
        </div>
      }
    >
      <HorseDetailsContent />
    </Suspense>
  );
}
