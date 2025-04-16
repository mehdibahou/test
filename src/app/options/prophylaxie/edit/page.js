"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  ChevronLeft,
  Pill,
  Leaf,
  Scissors,
  Clock,
  ArrowRight,
  Calendar,
  Check,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Loading component for Suspense fallback
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

// Helper functions for date validation
function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

function formatDateSafely(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date.toISOString();
  } catch (error) {
    throw new Error(`Format de date invalide: ${dateString}`);
  }
}

// Helper function to create safe folder name - same as in creation
function createSafeFolderName(str) {
  return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

// Date input component
const DateInputSection = ({
  title,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
      <Calendar className="w-6 h-6 mr-2 opacity-75" />
      {title}
    </label>
    <input
      type="date"
      name={name}
      value={value || ""}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 
               focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
               outline-none transition-all bg-white/50"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Text input component
const TextInputSection = ({
  title,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
      <FileText className="w-6 h-6 mr-2 opacity-75" />
      {title}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 
               focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
               outline-none transition-all bg-white/50"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Text area component
const TextAreaSection = ({
  title,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
      <FileText className="w-6 h-6 mr-2 opacity-75" />
      {title}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-32 px-4 py-3 rounded-xl border border-gray-200 
               focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
               outline-none transition-all resize-none bg-white/50"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Checkbox group component for multiple selections with optional custom input
const CheckboxGroupSection = ({
  title,
  name,
  options,
  selectedValues,
  onChange,
  onCustomValueChange,
  customValue,
}) => {
  // Track whether "Autres" is selected
  const isOtherSelected = selectedValues.includes("Autres");

  const handleCheckboxChange = (value) => {
    let newSelectedValues;

    if (selectedValues.includes(value)) {
      // Remove value if already selected
      newSelectedValues = selectedValues.filter((item) => item !== value);
    } else {
      // Add value if not selected
      newSelectedValues = [...selectedValues, value];
    }

    onChange(newSelectedValues);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
      <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
        <FileText className="w-6 h-6 mr-2 opacity-75" />
        {title}
      </label>
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
              ${
                selectedValues.includes(option.value)
                  ? "bg-[#1B4D3E]/10 border-[#1B4D3E]/20"
                  : "border-gray-200 hover:border-[#1B4D3E]/20"
              }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
              ${
                selectedValues.includes(option.value)
                  ? "bg-[#1B4D3E] border-[#1B4D3E]"
                  : "border-gray-300"
              }`}
            >
              {selectedValues.includes(option.value) && (
                <Check className="w-4 h-4 text-white" />
              )}
            </div>
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              className="hidden"
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>

      {/* Custom input for "Autres" option */}
      {isOtherSelected && onCustomValueChange && (
        <div className="mt-4 ml-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Précisez la maladie
          </label>
          <input
            type="text"
            value={customValue || ""}
            onChange={(e) => onCustomValueChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                      focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                      outline-none transition-all bg-white/50"
            placeholder="Entrez le nom de la maladie..."
            required
          />
          {!customValue && (
            <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Veuillez préciser la maladie</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main Edit Form Component
function EditProphylaxie() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [key, setKey] = useState(0);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prophylaxieData, setProphylaxieData] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    date: "",
    dateRappel: "",
    notes: "",
    // Vaccination specific
    nomVaccin: "",
    maladies: [], // Changed from maladie to maladies array
    maladieAutre: "", // For custom "Autres" disease
    // Vermifugation specific
    nomProduit: "",
    // Soins dentaires specific
    typeIntervention: "",
    // Autre specific
    typeAutre: "",
    descriptionAutre: "",
  });

  // Fetch prophylaxie data
  useEffect(() => {
    const fetchProphylaxieData = async () => {
      const prophylaxieId = searchParams.get("id");
      if (!prophylaxieId) {
        router.replace("/options/prophylaxie/list");
        return;
      }

      try {
        const BASE_URL = "http://localhost:3001/api";
        const response = await fetch(
          `${BASE_URL}/oneprophylaxie/${prophylaxieId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch prophylaxie data");
        }
        const data = await response.json();

        setProphylaxieData(data.data);

        // Safely parse dates
        let formattedDate = "";
        let formattedDateRappel = "";

        try {
          if (data.data.date && isValidDate(data.data.date)) {
            formattedDate = new Date(data.data.date)
              .toISOString()
              .split("T")[0];
          }
        } catch (error) {
          console.error("Error formatting date:", error);
        }

        try {
          if (data.data.dateRappel && isValidDate(data.data.dateRappel)) {
            formattedDateRappel = new Date(data.data.dateRappel)
              .toISOString()
              .split("T")[0];
          }
        } catch (error) {
          console.error("Error formatting date rappel:", error);
        }

        // Handle maladies data - convert from old format to new array format if needed
        let maladies = [];
        if (
          data.data.details?.maladies &&
          Array.isArray(data.data.details.maladies)
        ) {
          // If already in array format
          maladies = data.data.details.maladies;
        } else if (data.data.details?.maladie) {
          // If it's in the old single value format
          maladies = [data.data.details.maladie];
        }

        // Populate form data
        setFormData({
          date: formattedDate,
          dateRappel: formattedDateRappel,
          notes: data.data.notes || "",

          // Type-specific fields
          nomVaccin: data.data.details?.nomVaccin || "",
          maladies: maladies,
          maladieAutre: data.data.details?.maladieAutre || "",
          nomProduit: data.data.details?.nomProduit || "",
          typeIntervention: data.data.details?.typeIntervention || "",
          typeAutre: data.data.details?.typeAutre || "",
          descriptionAutre: data.data.details?.descriptionAutre || "",
        });

        setKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error fetching prophylaxie data:", error);
        alert("Une erreur est survenue lors du chargement des données");
        router.replace("/options/prophylaxie/list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProphylaxieData();
  }, [searchParams, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMaladiesChange = (selectedMaladies) => {
    setFormData((prev) => ({
      ...prev,
      maladies: selectedMaladies,
    }));
  };

  const handleCustomMaladieChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      maladieAutre: value,
    }));
  };

  // Generate the PDF document - same as in creation
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Helper function to check if we need a new page
    const checkAndAddPage = (currentY, neededSpace = 20) => {
      if (currentY + neededSpace > 250) {
        doc.addPage();
        return 20;
      }
      return currentY;
    };

    // Add header
    let y = 20;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, y - 5, 190, y - 5);
    doc.line(20, y + 25, 190, y + 25);
    doc.line(20, y - 5, 20, y + 25);
    doc.line(190, y - 5, 190, y + 25);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`Rapport de ${prophylaxieData.type}`, 105, y + 7, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    y += 40;

    // Format date safely for the PDF
    let formattedDate;
    try {
      formattedDate = new Date(formData.date).toLocaleDateString("fr-FR");
    } catch (error) {
      formattedDate = "Date invalide";
    }

    // Reference information
    doc.autoTable({
      startY: y,
      theme: "plain",
      styles: { fontSize: 11, lineWidth: 0.1 },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { cellWidth: 60 },
      },
      body: [["Date:", formattedDate]],
    });

    y = doc.lastAutoTable.finalY + 15;

    // Helper function to add sections
    const addSection = (title, content) => {
      y = checkAndAddPage(y, 30);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title, 20, y);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, y + 2, 190, y + 2);

      y += 10;

      if (content && content.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const textLines = doc.splitTextToSize(content.trim(), 160);

        for (let i = 0; i < textLines.length; i++) {
          y = checkAndAddPage(y, 7);
          doc.text(textLines[i], 25, y);
          y += 6;
        }
      } else {
        y += 2;
      }

      y += 10;
      return y;
    };

    // Add horse information
    y = addSection("INFORMATION DU CHEVAL", "");

    // Format birth date safely
    let birthDateFormatted = "---";
    if (
      prophylaxieData.horse.birthDate &&
      isValidDate(prophylaxieData.horse.birthDate)
    ) {
      try {
        birthDateFormatted = new Date(
          prophylaxieData.horse.birthDate
        ).toLocaleDateString("fr-FR");
      } catch (error) {
        birthDateFormatted = "---";
      }
    }

    // Horse details table
    doc.autoTable({
      startY: y,
      theme: "plain",
      styles: { fontSize: 11 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
      body: [
        ["Nom:", prophylaxieData.horse.name],
        ["Matricule:", prophylaxieData.horse.matricule || "---"],
        ["Race:", String(prophylaxieData.horse.race) || "---"],
        ["Discipline:", String(prophylaxieData.horse.discipline) || "---"],
        ["Date de Naissance:", birthDateFormatted],
      ],
    });

    y = doc.lastAutoTable.finalY + 15;

    // Add prophylaxie details based on type
    y = addSection(`DÉTAILS DE ${prophylaxieData.type.toUpperCase()}`, "");

    const details = [];

    // Add type-specific details
    switch (prophylaxieData.type) {
      case "Vaccination":
        details.push(["Nom du vaccin:", formData.nomVaccin]);

        // Format selected maladies for display
        let maladiesText = "";
        formData.maladies.forEach((maladie, index) => {
          if (maladie === "Autres") {
            maladiesText += formData.maladieAutre;
          } else {
            maladiesText += maladie;
          }

          if (index < formData.maladies.length - 1) {
            maladiesText += ", ";
          }
        });

        details.push(["Maladies:", maladiesText]);
        break;
      case "Vermifugation":
        details.push(["Nom du produit:", formData.nomProduit]);
        break;
      case "Soins dentaires":
        details.push(["Type d'intervention:", formData.typeIntervention]);
        break;
      case "Autre":
        details.push(
          ["Type:", formData.typeAutre],
          ["Description:", formData.descriptionAutre]
        );
        break;
    }

    // Format dates safely for details
    let dateFormatted, dateRappelFormatted;
    try {
      dateFormatted = new Date(formData.date).toLocaleDateString("fr-FR");
    } catch (error) {
      dateFormatted = "Date invalide";
    }

    try {
      dateRappelFormatted = new Date(formData.dateRappel).toLocaleDateString(
        "fr-FR"
      );
    } catch (error) {
      dateRappelFormatted = "Date invalide";
    }

    // Add common details
    details.push(
      ["Date de réalisation:", dateFormatted],
      ["Date de rappel:", dateRappelFormatted]
    );

    // Add details table
    doc.autoTable({
      startY: y,
      theme: "plain",
      styles: { fontSize: 11 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
      body: details,
    });

    y = doc.lastAutoTable.finalY + 15;

    // Add notes if any
    if (formData.notes) {
      y = addSection("NOTES", formData.notes);
    }

    // Create the PDF blob and return it
    return doc.output("blob");
  };

  // Upload the PDF file to the server - same approach as in creation
  const uploadPDFToServer = async (pdfBlob, prophylaxieId) => {
    try {
      // Create a FormData object to send the file
      const formDataObj = new FormData();

      // Use the exact same date string for consistency with creation
      const dateStr = new Date(formData.date).toISOString().split("T")[0];

      // Use the exact same folder name as in creation
      const folderName = createSafeFolderName(
        `${prophylaxieData.type}_${dateStr}`
      );

      // Use the exact same file name as in creation
      const fileName = `${prophylaxieData.type}_${prophylaxieData.horse.name}_${dateStr}.pdf`;

      formDataObj.append(
        "file",
        new File([pdfBlob], fileName, { type: "application/pdf" })
      );
      formDataObj.append("prophylaxieId", prophylaxieId);
      formDataObj.append("horseId", prophylaxieData.horse._id);
      formDataObj.append(
        "newid",
        prophylaxieData.horse.horseId || prophylaxieData.horse._id
      );

      formDataObj.append("dateStr", dateStr);
      formDataObj.append("fileName", fileName);
      formDataObj.append("folderName", folderName);
      formDataObj.append("documentType", "prophylaxie");

      // Use the exact same API endpoint as in creation
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(`${BASE_URL}/upload-prophylaxie-document`, {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'upload du PDF");
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading PDF:", error);
      throw new Error(`Erreur lors de l'upload du PDF: ${error.message}`);
    }
  };

  const canSubmit = () => {
    // Basic validation
    if (!formData.date || !formData.dateRappel) return false;

    // Date validation
    if (!isValidDate(formData.date) || !isValidDate(formData.dateRappel))
      return false;

    // Type-specific validation
    if (prophylaxieData && prophylaxieData.type === "Vaccination") {
      if (!formData.nomVaccin || formData.maladies.length === 0) return false;
      // For "Autres" disease, require custom input
      if (formData.maladies.includes("Autres") && !formData.maladieAutre)
        return false;
    }

    if (
      prophylaxieData &&
      prophylaxieData.type === "Vermifugation" &&
      !formData.nomProduit
    )
      return false;
    if (
      prophylaxieData &&
      prophylaxieData.type === "Soins dentaires" &&
      !formData.typeIntervention
    )
      return false;
    if (
      prophylaxieData &&
      prophylaxieData.type === "Autre" &&
      !formData.typeAutre
    )
      return false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !canSubmit()) return;

    try {
      setIsSubmitting(true);

      // Validate dates first
      if (!isValidDate(formData.date)) {
        throw new Error(
          "La date de réalisation est invalide. Veuillez utiliser le format YYYY-MM-DD."
        );
      }

      if (!isValidDate(formData.dateRappel)) {
        throw new Error(
          "La date de rappel est invalide. Veuillez utiliser le format YYYY-MM-DD."
        );
      }

      // Prepare prophylaxie details based on type
      const prophylaxieDetails = {};

      switch (prophylaxieData.type) {
        case "Vaccination":
          prophylaxieDetails.nomVaccin = formData.nomVaccin;
          prophylaxieDetails.maladies = formData.maladies;
          // Include the custom value if "Autres" is selected
          if (formData.maladies.includes("Autres")) {
            prophylaxieDetails.maladieAutre = formData.maladieAutre;
          }
          break;
        case "Vermifugation":
          prophylaxieDetails.nomProduit = formData.nomProduit;
          break;
        case "Soins dentaires":
          prophylaxieDetails.typeIntervention = formData.typeIntervention;
          break;
        case "Autre":
          prophylaxieDetails.typeAutre = formData.typeAutre;
          prophylaxieDetails.descriptionAutre = formData.descriptionAutre;
          break;
      }

      // Generate PDF - same as in creation
      const pdfBlob = generatePDF();

      // Prepare update payload with safe date handling
      const updatePayload = {
        horseId: prophylaxieData.horse._id,
        type: prophylaxieData.type,
        date: formatDateSafely(formData.date),
        dateRappel: formatDateSafely(formData.dateRappel),
        details: prophylaxieDetails,
        notes: formData.notes,
      };

      // Update prophylaxie record
      const BASE_URL = "http://localhost:3001/api";
      const response = await fetch(
        `${BASE_URL}/prophylaxie/${prophylaxieData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      // Upload the PDF using same approach as creation
      const uploadResult = await uploadPDFToServer(
        pdfBlob,
        prophylaxieData._id
      );

      // Update the prophylaxie record with the file path
      if (uploadResult && uploadResult.path) {
        await fetch(`${BASE_URL}/prophylaxie/${prophylaxieData._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: [uploadResult.path],
          }),
        });
      }

      router.push("/options/prophylaxie/list");
    } catch (error) {
      console.error("Error during update:", error);
      alert(error.message || "Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  // Get icon based on prophylaxie type
  const getTypeIcon = () => {
    switch (prophylaxieData.type) {
      case "Vaccination":
        return <Pill className="w-5 h-5" />;
      case "Vermifugation":
        return <Leaf className="w-5 h-5" />;
      case "Soins dentaires":
        return <Scissors className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  // Render form fields based on prophylaxie type
  const renderTypeSpecificFields = () => {
    switch (prophylaxieData.type) {
      case "Vaccination":
        return (
          <>
            <TextInputSection
              title="Nom du vaccin"
              name="nomVaccin"
              value={formData.nomVaccin}
              onChange={handleInputChange}
              placeholder="Entrez le nom du vaccin..."
              required={true}
            />
            <CheckboxGroupSection
              title="Maladies"
              name="maladies"
              options={[
                { value: "Grippe équine", label: "Grippe équine" },
                { value: "Rhinopneumonie", label: "Rhinopneumonie" },
                { value: "Tétanos", label: "Tétanos" },
                { value: "Autres", label: "Autres" },
              ]}
              selectedValues={formData.maladies}
              onChange={handleMaladiesChange}
              onCustomValueChange={handleCustomMaladieChange}
              customValue={formData.maladieAutre}
            />
          </>
        );
      case "Vermifugation":
        return (
          <TextInputSection
            title="Nom du produit"
            name="nomProduit"
            value={formData.nomProduit}
            onChange={handleInputChange}
            placeholder="Entrez le nom du produit vermifuge..."
            required={true}
          />
        );
      case "Soins dentaires":
        return (
          <TextInputSection
            title="Type d'intervention"
            name="typeIntervention"
            value={formData.typeIntervention}
            onChange={handleInputChange}
            placeholder="Décrivez le type d'intervention dentaire..."
            required={true}
          />
        );
      case "Autre":
        return (
          <>
            <TextInputSection
              title="Type d'intervention"
              name="typeAutre"
              value={formData.typeAutre}
              onChange={handleInputChange}
              placeholder="Précisez le type de soin préventif..."
              required={true}
            />
            <TextAreaSection
              title="Description détaillée"
              name="descriptionAutre"
              value={formData.descriptionAutre || ""}
              onChange={handleInputChange}
              placeholder="Décrivez l'intervention en détail..."
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      key={key}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-12"
    >
      <div className="mx-10 px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
            <button
              onClick={() => router.push("/options/prophylaxie/list")}
              className="flex items-center gap-2 px-4 py-2 text-[#1B4D3E] hover:bg-[#1B4D3E]/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Retour
            </button>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1B4D3E]/10 text-[#1B4D3E] rounded-lg">
              <div className="w-5 h-5">{getTypeIcon()}</div>
              <div>
                <div className="text-sm opacity-75">Type</div>
                <div className="font-medium">{prophylaxieData.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1B4D3E]/10 text-[#1B4D3E] rounded-lg">
              <FileText className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-75">Cheval</div>
                <div className="font-medium">
                  {prophylaxieData.horse.name}
                  {prophylaxieData.horse.matricule &&
                    ` (${prophylaxieData.horse.matricule})`}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
            <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6">
              Modifier {prophylaxieData.type}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Modification du suivi préventif
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Common date fields */}
          <DateInputSection
            title="Date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            placeholder="Sélectionnez la date..."
            required={true}
          />

          {/* Type-specific fields */}
          {renderTypeSpecificFields()}

          {/* Common date rappel field */}
          <DateInputSection
            title="Date de rappel"
            name="dateRappel"
            value={formData.dateRappel}
            onChange={handleInputChange}
            placeholder="Sélectionnez la date de rappel..."
            required={true}
          />

          {/* Notes field */}
          <TextAreaSection
            title="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Ajoutez des notes supplémentaires..."
          />

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/options/prophylaxie/list")}
              className="px-8 py-3 rounded-xl font-medium flex items-center gap-2 
                      bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit()}
              className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 
                      transition-all transform hover:scale-[1.02] ${
                        isSubmitting || !canSubmit()
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white shadow-lg hover:shadow-xl"
                      }`}
            >
              {isSubmitting ? (
                <>
                  Mise à jour...
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  Mettre à jour
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function EditProphylaxiePage() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <EditProphylaxie />
    </Suspense>
  );
}
