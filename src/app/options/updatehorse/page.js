"use client";
import React, { useState, useEffect, Suspense } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";

function UpdateHorseForm() {
  const searchParams = useSearchParams();
  const horseId = searchParams.get("h");

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    matricule: "",
    race: "",
    otherRace: "",
    birthDate: "",
    sex: "",
    robe: "",
    otherRobe: "",
    discipline: "",
    otherDiscipline: "",
    ecasSubCategory: "",
    otherEcasSubCategory: "", // New field for custom ECAS subcategory
    father: null,
    fatherText: "",
    mother: null,
    motherText: "",
    Provenance: "",
    otherProvenance: "",
    Taille: "",
    Puce: "",
    Detachement: "",
    otherDetachement: "",
  });

  // UI state
  const [showOtherRace, setShowOtherRace] = useState(false);
  const [showOtherRobe, setShowOtherRobe] = useState(false);
  const [showOtherDiscipline, setShowOtherDiscipline] = useState(false);
  const [showOtherProvenance, setShowOtherProvenance] = useState(false);
  const [showOtherDetachement, setShowOtherDetachement] = useState(false);
  const [showOtherEcasSubCategory, setShowOtherEcasSubCategory] =
    useState(false); // New state for custom ECAS subcategory
  const [fatherSearch, setFatherSearch] = useState("");
  const [motherSearch, setMotherSearch] = useState("");
  const [fatherSuggestions, setFatherSuggestions] = useState([]);
  const [motherSuggestions, setMotherSuggestions] = useState([]);
  const [showFatherSuggestions, setShowFatherSuggestions] = useState(false);
  const [showMotherSuggestions, setShowMotherSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Constants
  const races = [
    "Arabe",
    "Barbe",
    "Arabe-barbe",
    "CMS",
    "CSM",
    "A.H.A",
    "Argentine",
    "Autre",
  ];
  const robes = [
    "Alezan",
    "Palomino",
    "Bai",
    "Gris",
    "Noir",
    "Isabelle",
    "Autre",
  ];
  const disciplines = [
    "1er Escadron Fusiliers",
    "2eme Escadron Fusiliers",
    "Escadron FanFare",
    "Escadron Honneurs",
    "E.C.A.S",
    "Autre",
  ];
  const provenanceOptions = [
    "Jumenterie (GR)",
    "Achat à l'etranger",
    "Achat au Maroc",
    "Autre",
  ];
  const detachementOptions = [
    "Domaine Larach",
    "MM5",
    "Souissi",
    "Dar Essalam",
    "El Mansouri",
    "Autre",
  ];
  const ecasSubCategories = [
    "Chasse",
    "CSO",
    "Club",
    "Course",
    "Endurance",
    "Polo",
    "Voltige",
    "Poneys",
    "Equine EL GAADA",
    "Reprise Princière",
    "Reprise Royale",
    "Autre", // Added "Autre" option
  ];
  const sexes = ["Male", "Femelle", "Hongre"];

  // Fetch horse data when component mounts
  useEffect(() => {
    const fetchHorseData = async () => {
      if (!horseId) {
        setInitialLoading(false);
        setError("No horse ID provided");
        return;
      }

      try {
        const BASE_URL = "http://localhost:3001/api";
        const response = await fetch(`${BASE_URL}/horse/${horseId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch horse data");
        }

        let horse = await response.json();
        horse = horse.data;

        // Handle ECAS discipline and subcategory
        let mainDiscipline = horse.discipline;
        let subCategory = "";
        let otherSubCategory = "";
        let isCustomSubCategory = false;

        if (horse.discipline?.startsWith("E.C.A.S-")) {
          mainDiscipline = "E.C.A.S";
          const extractedSubCategory = horse.discipline.split("E.C.A.S-")[1];

          // Check if the subcategory is in our predefined list
          if (ecasSubCategories.includes(extractedSubCategory)) {
            subCategory = extractedSubCategory;
          } else {
            // This is a custom subcategory
            subCategory = "Autre";
            otherSubCategory = extractedSubCategory;
            isCustomSubCategory = true;
          }
        }

        // Setup form data
        const updatedFormData = {
          name: horse.name || "",
          matricule: horse.matricule || "",
          race: races.includes(horse.race) ? horse.race : "Autre",
          otherRace: !races.includes(horse.race) ? horse.race : "",
          birthDate: horse.birthDate
            ? new Date(horse.birthDate).toISOString().split("T")[0]
            : "",
          sex: horse.sex || "",
          robe: robes.includes(horse.robe) ? horse.robe : "Autre",
          otherRobe: !robes.includes(horse.robe) ? horse.robe : "",
          discipline: mainDiscipline,
          ecasSubCategory: subCategory,
          otherEcasSubCategory: otherSubCategory, // Set the custom subcategory
          otherDiscipline:
            !disciplines.includes(mainDiscipline) &&
            mainDiscipline !== "E.C.A.S"
              ? mainDiscipline
              : "",
          father: horse.father?._id || null,
          fatherText: horse.father
            ? `${horse.father.name} (${
                horse.father.matricule || "No matricule"
              })`
            : horse.fatherText || "",
          mother: horse.mother?._id || null,
          motherText: horse.mother
            ? `${horse.mother.name} (${
                horse.mother.matricule || "No matricule"
              })`
            : horse.motherText || "",
          // New fields
          Provenance: provenanceOptions.includes(horse.Provenance)
            ? horse.Provenance
            : "Autre",
          otherProvenance:
            !provenanceOptions.includes(horse.Provenance) && horse.Provenance
              ? horse.Provenance
              : "",
          Taille: horse.Taille || "",
          Puce: horse.Puce || "",
          Detachement: detachementOptions.includes(horse.Detachement)
            ? horse.Detachement
            : "Autre",
          otherDetachement:
            !detachementOptions.includes(horse.Detachement) && horse.Detachement
              ? horse.Detachement
              : "",
        };

        setFormData(updatedFormData);
        setFatherSearch(updatedFormData.fatherText);
        setMotherSearch(updatedFormData.motherText);
        setShowOtherRace(!races.includes(horse.race) && horse.race);
        setShowOtherRobe(!robes.includes(horse.robe) && horse.robe);
        setShowOtherDiscipline(
          !disciplines.includes(mainDiscipline) && mainDiscipline !== "E.C.A.S"
        );
        setShowOtherProvenance(
          !provenanceOptions.includes(horse.Provenance) && horse.Provenance
        );
        setShowOtherDetachement(
          !detachementOptions.includes(horse.Detachement) && horse.Detachement
        );
        setShowOtherEcasSubCategory(isCustomSubCategory);
      } catch (err) {
        console.error("Error fetching horse data:", err);
        setError("Failed to load horse data. Please try again.");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchHorseData();
  }, [horseId]);

  // Parent search function
  const searchParents = async (searchText) => {
    try {
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(
        `${BASE_URL}/horse?q=${encodeURIComponent(searchText)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const horses = await response.json();
      return horses;
    } catch (error) {
      console.error("Error searching horses:", error);
      return [];
    }
  };

  // Parent search handlers with text support
  const handleFatherSearch = async (e) => {
    const searchText = e.target.value;
    setFatherSearch(searchText);

    setFormData((prev) => ({
      ...prev,
      fatherText: searchText,
      father: null,
    }));

    if (searchText.length >= 2) {
      setShowFatherSuggestions(true);
      const results = await searchParents(searchText);
      setFatherSuggestions(results);
    } else {
      setShowFatherSuggestions(false);
      setFatherSuggestions([]);
    }
  };

  const handleMotherSearch = async (e) => {
    const searchText = e.target.value;
    setMotherSearch(searchText);

    setFormData((prev) => ({
      ...prev,
      motherText: searchText,
      mother: null,
    }));

    if (searchText.length >= 2) {
      setShowMotherSuggestions(true);
      const results = await searchParents(searchText);
      setMotherSuggestions(results);
    } else {
      setShowMotherSuggestions(false);
      setMotherSuggestions([]);
    }
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".parent-search")) {
        setShowFatherSuggestions(false);
        setShowMotherSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle parent selection from suggestions
  const handleParentSelection = (horse, parentType) => {
    if (parentType === "father") {
      setFormData((prev) => ({
        ...prev,
        father: horse._id,
        fatherText: `${horse.name} (${horse.matricule})`,
      }));
      setFatherSearch(`${horse.name} (${horse.matricule})`);
      setShowFatherSuggestions(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        mother: horse._id,
        motherText: `${horse.name} (${horse.matricule})`,
      }));
      setMotherSearch(`${horse.name} (${horse.matricule})`);
      setShowMotherSuggestions(false);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const actualRace = showOtherRace ? formData.otherRace : formData.race;
      const actualRobe = showOtherRobe ? formData.otherRobe : formData.robe;
      const actualProvenance = showOtherProvenance
        ? formData.otherProvenance
        : formData.Provenance;
      const actualDetachement = showOtherDetachement
        ? formData.otherDetachement
        : formData.Detachement;

      let actualDiscipline;
      if (formData.discipline === "E.C.A.S") {
        if (
          formData.ecasSubCategory === "Autre" &&
          formData.otherEcasSubCategory
        ) {
          // Use the custom subcategory if "Autre" is selected
          actualDiscipline = `E.C.A.S-${formData.otherEcasSubCategory}`;
        } else if (formData.ecasSubCategory) {
          // Use the selected subcategory
          actualDiscipline = `E.C.A.S-${formData.ecasSubCategory}`;
        } else {
          actualDiscipline = formData.discipline;
        }
      } else if (showOtherDiscipline) {
        actualDiscipline = formData.otherDiscipline;
      } else {
        actualDiscipline = formData.discipline;
      }

      const submissionData = {
        name: formData.name,
        matricule: formData.matricule,
        race: actualRace,
        birthDate: formData.birthDate,
        sex: formData.sex,
        robe: actualRobe,
        discipline: actualDiscipline,
        Provenance: actualProvenance,
        Taille: formData.Taille,
        Puce: formData.Puce,
        Detachement: actualDetachement,
      };

      if (formData.father) {
        submissionData.father = formData.father;
      } else if (formData.fatherText) {
        submissionData.fatherText = formData.fatherText;
      }

      if (formData.mother) {
        submissionData.mother = formData.mother;
      } else if (formData.motherText) {
        submissionData.motherText = formData.motherText;
      }

      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/horse/${horseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update horse");
      }

      const data = await response.json();

      if (data.success) {
        window.location.href = `/options/horses/horse?h=${
          data.data?._id || horseId
        }`;
      } else {
        throw new Error(data.error || "Failed to update horse");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      "name",
      "race",
      "birthDate",
      "sex",
      "robe",
      "discipline",
      "Provenance",
    ];
    return requiredFields.every((field) => {
      if (field === "race" && showOtherRace) return formData.otherRace;
      if (field === "robe" && showOtherRobe) return formData.otherRobe;
      if (field === "discipline") {
        if (showOtherDiscipline) return formData.otherDiscipline;
        if (formData.discipline === "E.C.A.S") {
          if (formData.ecasSubCategory === "Autre")
            return formData.otherEcasSubCategory;
          return formData.ecasSubCategory;
        }
        return formData.discipline;
      }
      if (field === "Provenance" && showOtherProvenance)
        return formData.otherProvenance;
      return formData[field];
    });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-10 px-6 py-12">
        {/* Form Title */}
        <div className="mb-10 relative">
          <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
          <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6">
            Modifier le Cheval
          </h1>
          <p className="text-gray-600 mt-2">
            Mettre à jour les informations du cheval
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Informations de Base
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-black border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  placeholder="Entrer le nom"
                />
              </div>

              {/* Matricule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matricule
                </label>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-black border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  placeholder="Entrer le matricule"
                />
              </div>

              {/* Race */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Race
                </label>
                <select
                  name="race"
                  value={formData.race}
                  onChange={(e) => {
                    handleInputChange(e);
                    setShowOtherRace(e.target.value === "Autre");
                  }}
                  className="w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                >
                  <option value="">Sélectionner une race</option>
                  {races.map((race) => (
                    <option key={race} value={race}>
                      {race}
                    </option>
                  ))}
                </select>
                {showOtherRace && (
                  <input
                    type="text"
                    name="otherRace"
                    value={formData.otherRace}
                    onChange={handleInputChange}
                    placeholder="Spécifier la race"
                    className="mt-2 w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de Naissance
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexe
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  className="w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                >
                  <option value="">Sélectionner le sexe</option>
                  {sexes.map((sex) => (
                    <option key={sex} value={sex}>
                      {sex}
                    </option>
                  ))}
                </select>
              </div>

              {/* Robe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Robe
                </label>
                <select
                  name="robe"
                  value={formData.robe}
                  onChange={(e) => {
                    handleInputChange(e);
                    setShowOtherRobe(e.target.value === "Autre");
                  }}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                >
                  <option value="">Sélectionner la robe</option>
                  {robes.map((robe) => (
                    <option key={robe} value={robe}>
                      {robe}
                    </option>
                  ))}
                </select>
                {showOtherRobe && (
                  <input
                    type="text"
                    name="otherRobe"
                    value={formData.otherRobe}
                    onChange={handleInputChange}
                    placeholder="Spécifier la robe"
                    className="mt-2 w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                )}
              </div>

              {/* Provenance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provenance
                </label>
                <select
                  name="Provenance"
                  value={formData.Provenance}
                  onChange={(e) => {
                    handleInputChange(e);
                    setShowOtherProvenance(e.target.value === "Autre");
                  }}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                >
                  <option value="">Sélectionner la provenance</option>
                  {provenanceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {showOtherProvenance && (
                  <input
                    type="text"
                    name="otherProvenance"
                    value={formData.otherProvenance}
                    onChange={handleInputChange}
                    placeholder="Spécifier la provenance"
                    className="mt-2 w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                )}
              </div>

              {/* Taille */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille
                </label>
                <input
                  type="text"
                  name="Taille"
                  value={formData.Taille}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-black border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  placeholder="Entrer la taille"
                />
              </div>

              {/* Puce */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Puce
                </label>
                <input
                  type="text"
                  name="Puce"
                  value={formData.Puce}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl text-black border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  placeholder="Entrer le numéro de puce"
                />
              </div>

              {/* Detachement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detachement
                </label>
                <select
                  name="Detachement"
                  value={formData.Detachement}
                  onChange={(e) => {
                    handleInputChange(e);
                    setShowOtherDetachement(e.target.value === "Autre");
                  }}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                >
                  <option value="">Sélectionner le detachement</option>
                  {detachementOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {showOtherDetachement && (
                  <input
                    type="text"
                    name="otherDetachement"
                    value={formData.otherDetachement}
                    onChange={handleInputChange}
                    placeholder="Spécifier le detachement"
                    className="mt-2 w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Discipline */}
          <div className="bg-white/70 z-10 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Position
            </h2>
            <div className="space-y-4">
              <div>
                <select
                  name="discipline"
                  value={formData.discipline}
                  onChange={(e) => {
                    handleInputChange(e);
                    setShowOtherDiscipline(e.target.value === "Autre");
                    // Reset subcategory when discipline changes
                    if (e.target.value !== "E.C.A.S") {
                      setFormData((prev) => ({
                        ...prev,
                        ecasSubCategory: "",
                        otherEcasSubCategory: "",
                      }));
                      setShowOtherEcasSubCategory(false);
                    }
                  }}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                >
                  <option value="">Sélectionner la discipline</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline} value={discipline}>
                      {discipline}
                    </option>
                  ))}
                </select>

                {/* ECAS Subcategory dropdown */}
                {formData.discipline === "E.C.A.S" && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      name="ecasSubCategory"
                      value={formData.ecasSubCategory}
                      onChange={(e) => {
                        handleInputChange(e);
                        setShowOtherEcasSubCategory(e.target.value === "Autre");
                        // Reset the custom subcategory when changing the selection
                        if (e.target.value !== "Autre") {
                          setFormData((prev) => ({
                            ...prev,
                            otherEcasSubCategory: "",
                          }));
                        }
                      }}
                      className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {ecasSubCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    {/* Custom ECAS subcategory input field */}
                    {showOtherEcasSubCategory && (
                      <input
                        type="text"
                        name="otherEcasSubCategory"
                        value={formData.otherEcasSubCategory}
                        onChange={handleInputChange}
                        placeholder="Spécifier la catégorie"
                        className="mt-2 w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                      />
                    )}
                  </div>
                )}

                {showOtherDiscipline && (
                  <input
                    type="text"
                    name="otherDiscipline"
                    value={formData.otherDiscipline}
                    onChange={handleInputChange}
                    placeholder="Spécifier la discipline"
                    className="mt-2 w-full px-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Genealogy */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">
              Généalogie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Father */}
              <div className="relative parent-search">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Père
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher ou entrer le nom du père..."
                    value={fatherSearch}
                    onChange={handleFatherSearch}
                    onFocus={() => setShowFatherSuggestions(true)}
                    className="w-full pl-12 pr-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                </div>

                {showFatherSuggestions &&
                  fatherSuggestions.data?.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {fatherSuggestions.data.map((horse) => (
                        <div
                          key={horse._id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleParentSelection(horse, "father")}
                        >
                          <div className="font-medium">{horse.name}</div>
                          <div className="text-sm text-gray-600">
                            Matricule: {horse.matricule}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              {/* Mother */}
              <div className="relative parent-search">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mère
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher ou entrer le nom de la mère..."
                    value={motherSearch}
                    onChange={handleMotherSearch}
                    onFocus={() => setShowMotherSuggestions(true)}
                    className="w-full pl-12 pr-4 text-black py-3 rounded-xl border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                  />
                </div>

                {showMotherSuggestions &&
                  motherSuggestions.data?.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                      {motherSuggestions.data.map((horse) => (
                        <div
                          key={horse._id}
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleParentSelection(horse, "mother")}
                        >
                          <div className="font-medium">{horse.name}</div>
                          <div className="text-sm text-gray-600">
                            Matricule: {horse.matricule}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl transition-colors duration-200 font-medium shadow-sm hover:shadow-md hover:bg-gray-300"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading || !validateForm()}
              className={`px-8 py-3 bg-[#1B4D3E] text-white rounded-xl transition-colors duration-200 font-medium shadow-sm hover:shadow-md ${
                loading || !validateForm()
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#153729]"
              }`}
            >
              {loading ? "Mise à jour..." : "Mettre à jour le Cheval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UpdateHorsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B4D3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        </div>
      }
    >
      <UpdateHorseForm />
    </Suspense>
  );
}
