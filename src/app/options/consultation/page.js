"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  ChevronLeft,
  Stethoscope,
  ArrowRight,
  PlusCircle,
  Check,
  CrossIcon,
  XIcon,
} from "lucide-react";
import FileUploadSection from "./uploadbar";
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

// Form Section Component
const FormSection = ({ title, name, value, onChange, placeholder }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
      <FileText className="w-6 h-6 mr-2 opacity-75" />
      {title}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-48 px-4 py-3 rounded-xl border border-gray-200 
               focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
               outline-none transition-all resize-none bg-white/50"
      placeholder={placeholder}
      required
    />
  </div>
);

// Date picker component for Date de Guérison
const DatePickerSection = ({ value, onChange }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
      <FileText className="w-6 h-6 mr-2 opacity-75" />
      Date de Guérison
    </label>
    <div className="flex flex-col">
      <input
        type="date"
        name="dateDeGuerison"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 
                 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                 outline-none transition-all bg-white/50"
      />
      <p className="text-sm text-gray-500 mt-2">
        Laissez vide si la guérison n'est pas encore établie
      </p>
    </div>
  </div>
);

// Date picker component for Date de Rappel
const DateRappelSection = ({ value, onChange }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
      <FileText className="w-6 h-6 mr-2 opacity-75" />
      Date de Rappel
    </label>
    <div className="flex flex-col">
      <input
        type="date"
        name="dateRappel"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 
                 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                 outline-none transition-all bg-white/50"
      />
      <p className="text-sm text-gray-500 mt-2">
        Date à laquelle un suivi est nécessaire
      </p>
    </div>
  </div>
);

// Username input component
const UsernameSection = ({ value, onChange }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
    <label className="block text-xl font-semibold text-[#1B4D3E] mb-4 flex items-center">
      <FileText className="w-6 h-6 mr-2 opacity-75" />
      Nom d'utilisateur
    </label>
    <input
      type="text"
      name="username"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 
               focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
               outline-none transition-all bg-white/50"
      placeholder="Entrez le nom d'utilisateur..."
    />
  </div>
);

// Main Form Component
function TestForm({ searchParams }) {
  const router = useRouter();
  const fileUploadRef = useRef(null);

  // States
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testData, setTestData] = useState({ horse: null, test: null });
  const [formData, setFormData] = useState({
    anamnese: "",
    examenClinique: "",
    diagnostiques: "",
    traitements: "",
    pronostic: "",
    dateDeGuerison: "",
    dateRappel: "", // Added date de rappel field
    username: "", // Added username field
  });
  const [selectedExamsWithComments, setSelectedExamsWithComments] = useState(
    []
  );
  console.log(selectedExamsWithComments, "kjhgfcx");
  const [otherExam, setOtherExam] = useState("");

  const complementaryExams = [
    "Radiographie",
    "Échographie",
    "Analyse sanguine",
    "Endoscopie",
    "Thermographie",
    "Test d'effort",
    "Analyse d'urine",
    "IRM",
    "Scanner",
  ];

  // Verify URL parameters
  useEffect(() => {
    const requiredParams = ["horseId", "horseName", "testId", "testName"];

    const hasAllParams = requiredParams.every((param) => {
      const value = searchParams.get(param);
      return value !== null && value !== "";
    });

    if (!hasAllParams) {
      router.replace("/");
      return;
    }

    setTestData({
      horse: {
        newid: searchParams.get("newid"),
        race: searchParams.get("race"),
        discipline: searchParams.get("discipline"),
        id: searchParams.get("horseId"),
        name: searchParams.get("horseName"),
        matricule: searchParams.get("horseMatricule") || "",
        datenaissance: searchParams.get("datenaissance") || "",
      },
      test: {
        id: searchParams.get("testId"),
        name: searchParams.get("testName"),
      },
    });
    setIsAuthorized(true);
  }, [searchParams, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleComplementaryExamChange = (exam) => {
    setSelectedExamsWithComments((prev) => {
      if (prev.find((e) => e.name === exam)) {
        return prev.filter((e) => e.name !== exam);
      }
      return [...prev, { name: exam, comment: "" }];
    });
  };
  const [presaved, setPresaved] = useState({ exam: "", value: "" });

  const handleExamCommentChange = (examName, comment) => {
    setSelectedExamsWithComments((prev) => {
      const examExists = prev.some((exam) => exam.name === examName);
      if (examExists) {
        return prev.map((exam) =>
          exam.name === examName ? { ...exam, comment } : exam
        );
      } else {
        return [...prev, { name: examName, comment }];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Handle file uploads first
      const uploadResult = await fileUploadRef.current.uploadFiles();
      if (!uploadResult.success) {
        throw new Error(
          uploadResult.error || "Erreur lors du téléchargement des fichiers"
        );
      }

      // Generate PDF
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

      // Header function that can be reused for each page
      const addHeader = (pageY = 20) => {
        let y = pageY;

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, y - 5, 190, y - 5);
        doc.line(20, y + 25, 190, y + 25);
        doc.line(20, y - 5, 20, y + 25);
        doc.line(190, y - 5, 190, y + 25);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("Rapport Médical", 105, y + 7, {
          align: "center",
        });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        return y + 40;
      };

      const addPageNumber = (pageNumber) => {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.text(`Page ${pageNumber}`, 180, 290);
      };

      let y = addHeader();

      // Reference information
      doc.autoTable({
        startY: y,
        theme: "plain",
        styles: { fontSize: 11, lineWidth: 0.1 },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 40 },
          1: { cellWidth: 60 },
        },
        body: [["Date:", new Date().toLocaleDateString("fr-FR")]],
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

      // Add main sections
      y = addSection("INFORMATION DU CHEVAL", "");

      // Horse details table
      doc.autoTable({
        startY: y,
        theme: "plain",
        styles: { fontSize: 11 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
        body: [
          ["Nom:", testData.horse.name],
          ["Matricule:", testData.horse.matricule] || "---",
          ["Race:", String(testData.horse.race) || "---"],
          ["Discipline:", String(testData.horse.discipline) || "---"],
          [
            "Date de Naissance:",
            new Date(testData.horse.datenaissance).toLocaleDateString(
              "fr-FR"
            ) || "---",
          ],
        ],
      });

      y = doc.lastAutoTable.finalY + 15;

      // Clinical sections
      y = addSection("Anamnèse", formData.anamnese);
      y = addSection("Examen Clinique", formData.examenClinique);

      // Complementary Exams section with comments
      if (selectedExamsWithComments.length > 0 || otherExam) {
        y = checkAndAddPage(y, 20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Examens Complémentaires:", 20, y);
        y += 6;

        selectedExamsWithComments.forEach((exam) => {
          y = checkAndAddPage(y, 12);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(`${exam.name}:`, 25, y);
          y += 5;

          if (exam.comment) {
            const commentLines = doc.splitTextToSize(
              `Commentaire: ${exam.comment}`,
              150
            );
            commentLines.forEach((line) => {
              y = checkAndAddPage(y, 7);
              doc.text(line, 30, y);
              y += 5;
            });
          }
          y += 3;
        });
        y += 5;
      }

      y = addSection("Diagnostiques", formData.diagnostiques);

      // Add Date de Guérison section if a date was provided
      if (formData.dateDeGuerison) {
        y = checkAndAddPage(y, 30);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Date de Guérison", 20, y);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, y + 2, 190, y + 2);

        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(
          new Date(formData.dateDeGuerison).toLocaleDateString("fr-FR"),
          25,
          y
        );

        y += 16;
      }

      // Add Date de Rappel section if a date was provided
      if (formData.dateRappel) {
        y = checkAndAddPage(y, 30);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Date de Rappel", 20, y);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, y + 2, 190, y + 2);

        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(
          new Date(formData.dateRappel).toLocaleDateString("fr-FR"),
          25,
          y
        );

        y += 16;
      }

      // Add Username section if provided
      if (formData.username) {
        y = checkAndAddPage(y, 30);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Nom d'utilisateur", 20, y);

        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, y + 2, 190, y + 2);

        y += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(formData.username, 25, y);

        y += 16;
      }

      y = addSection("Traitements", formData.traitements);
      y = addSection("Pronostic", formData.pronostic);

      // Convert PDF to blob and prepare for upload
      const pdfBlob = doc.output("blob");
      const fileName = `${testData.test.name.replace(/\s+/g, "_")}_${
        testData.horse.name
      }_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.pdf`;

      const pdfFormData = new FormData();
      pdfFormData.append(
        "file",
        new File([pdfBlob], fileName, { type: "application/pdf" })
      );
      pdfFormData.append("fileName", fileName);
      pdfFormData.append("testName", testData.test.name);
      pdfFormData.append("horseId", testData.horse.id);
      pdfFormData.append("newid", testData.horse.newid);
      pdfFormData.append("date", new Date().toISOString());

      console.log(testData.horse.newid, "horseiddddddddddddd");
      // Upload PDF
      const BASE_URL = "http://localhost:3001/api";
      const pdfUploadResponse = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        body: pdfFormData,
      });

      if (!pdfUploadResponse.ok) {
        throw new Error("Failed to upload PDF");
      }

      const pdfUploadResult = await pdfUploadResponse.json();

      // Create test with updated examensComplementaires including comments
      const testPayload = {
        horseId: testData.horse.id,
        type: testData.test.name,
        date: new Date().toISOString(),
        dateDeGuerison: formData.dateDeGuerison
          ? new Date(formData.dateDeGuerison).toISOString()
          : null,
        dateRappel: formData.dateRappel
          ? new Date(formData.dateRappel).toISOString()
          : null,
        username: formData.username,
        anamnese: formData.anamnese.trim(),
        examenClinique: formData.examenClinique.trim(),
        examensComplementaires: [
          ...selectedExamsWithComments.map((exam) => ({
            name: exam.name,
            checked: true,
            comment: exam.comment,
          })),
          ...(otherExam
            ? [
                {
                  name: otherExam,
                  checked: true,
                  comment:
                    selectedExamsWithComments.find((e) => e.name === otherExam)
                      ?.comment || "",
                },
              ]
            : []),
        ],
        diagnostiques: formData.diagnostiques.trim(),
        traitements: formData.traitements.trim(),
        pronostic: formData.pronostic.trim(),
        file: uploadResult.files.map((file) => file.path) || [],
        createdBy: "65f6fcbe15bca4ff7c873525",
      };

      const response = await fetch(`${BASE_URL}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      // alert("Test enregistré avec succès");
      router.push("/options/doc");
    } catch (error) {
      console.error("Error:", error);
      // alert(
      //   error.message || "Une erreur est survenue lors de l'enregistrement"
      // );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-12">
      <div className="mx-10 px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1B4D3E]/10 text-[#1B4D3E] rounded-lg">
              <Stethoscope className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-75">Cheval</div>
                <div className="font-medium">
                  {testData.horse.name}
                  {testData.horse.matricule && ` (${testData.horse.matricule})`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1B4D3E]/10 text-[#1B4D3E] rounded-lg">
              <FileText className="w-5 h-5" />
              <div>
                <div className="text-sm opacity-75">Type de test</div>
                <div className="font-medium">{testData.test.name}</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-2 left-0 w-24 h-1 bg-gradient-to-r from-[#1B4D3E] to-transparent"></div>
            <h1 className="text-3xl font-bold text-[#1B4D3E] mt-6">
              Test Médical
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Formulaire d'examen médical
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection
            title="Anamnèse"
            name="anamnese"
            value={formData.anamnese}
            onChange={handleInputChange}
            placeholder="Entrez les détails de l'anamnèse..."
          />

          <FormSection
            title="Examen Clinique"
            name="examenClinique"
            value={formData.examenClinique}
            onChange={handleInputChange}
            placeholder="Entrez les détails de l'examen clinique..."
          />

          {/* Examens Complémentaires */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6 flex items-center">
              <PlusCircle className="w-6 h-6 mr-2 opacity-75" />
              Examens Complémentaires
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {complementaryExams.map((exam) => (
                  <label
                    key={exam}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                      ${
                        selectedExamsWithComments.some((e) => e.name === exam)
                          ? "bg-[#1B4D3E]/10 border-[#1B4D3E]/20"
                          : "border-gray-200 hover:border-[#1B4D3E]/20"
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                      ${
                        selectedExamsWithComments.some((e) => e.name === exam)
                          ? "bg-[#1B4D3E] border-[#1B4D3E]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedExamsWithComments.some(
                        (e) => e.name === exam
                      ) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedExamsWithComments.some(
                        (e) => e.name === exam
                      )}
                      onChange={() => handleComplementaryExamChange(exam)}
                    />
                    <span className="text-sm">{exam}</span>
                  </label>
                ))}
              </div>

              {/* Comments sections for selected exams */}
              <div className="space-y-4 mt-6">
                {selectedExamsWithComments.map((exam) => (
                  <div
                    key={exam.name}
                    className="bg-white/50 p-4 rounded-xl border border-gray-200"
                  >
                    <div className="flex justify-between">
                      <label className="block text-sm font-medium text-[#1B4D3E] mb-2">
                        Commentaire pour {exam.name}
                      </label>
                      <XIcon
                        className="cursor-pointer fill-red-700 hover:fill-red-400"
                        onClick={() => {
                          setSelectedExamsWithComments(
                            selectedExamsWithComments.filter(
                              (item) => item.name !== exam.name
                            )
                          );
                        }}
                        size={15}
                      />
                    </div>
                    <textarea
                      value={exam.comment}
                      onChange={(e) =>
                        handleExamCommentChange(exam.name, e.target.value)
                      }
                      className="w-full px-4 py-2 text-sm text-black rounded-lg border border-gray-200 
                               focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                               outline-none transition-all bg-white/50 resize-none h-24"
                      placeholder={`Ajoutez vos commentaires pour ${exam.name}...`}
                    />
                  </div>
                ))}
              </div>

              {/* Other exam input */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autre examen
                </label>
                <input
                  type="text"
                  value={otherExam}
                  onChange={(e) => setOtherExam(e.target.value)}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-200 
                           focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                           outline-none transition-all bg-white/50"
                  placeholder="Spécifier un autre examen..."
                />
                {otherExam && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-[#1B4D3E] mb-2">
                      Commentaire pour {otherExam}
                    </label>
                    <textarea
                      value={presaved?.value || ""}
                      onChange={(e) =>
                        setPresaved({
                          exam: otherExam,
                          value: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 text-sm text-black rounded-lg border border-gray-200 
                               focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 
                               outline-none transition-all bg-white/50 resize-none h-24"
                      placeholder={`Ajoutez vos commentaires pour ${otherExam}...`}
                    />
                    <div className="flex w-full justify-end">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleExamCommentChange(
                            presaved?.exam,
                            presaved?.value
                          );
                          setPresaved({
                            exam: "",
                            value: "",
                          });
                          setOtherExam("");
                        }}
                        className="bg-[#1B4D3E] p-2 text-white hover:text-[#1B4D3E] hover:bg-green-50 rounded-xl transition-colors items-end"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <FormSection
            title="Diagnostiques"
            name="diagnostiques"
            value={formData.diagnostiques}
            onChange={handleInputChange}
            placeholder="Entrez les diagnostiques..."
          />

          {/* Date de Guérison section */}
          <DatePickerSection
            value={formData.dateDeGuerison}
            onChange={handleInputChange}
          />

          {/* Date de Rappel section */}
          <DateRappelSection
            value={formData.dateRappel}
            onChange={handleInputChange}
          />

          {/* Username section */}
          <UsernameSection
            value={formData.username}
            onChange={handleInputChange}
          />

          <FormSection
            title="Traitements"
            name="traitements"
            value={formData.traitements}
            onChange={handleInputChange}
            placeholder="Entrez les traitements..."
          />

          <FormSection
            title="Pronostic - Remarques - Recommandations"
            name="pronostic"
            value={formData.pronostic}
            onChange={handleInputChange}
            placeholder="Entrez le pronostic, les remarques et les recommandations..."
          />

          {/* Upload Section */}
          <FileUploadSection
            ref={fileUploadRef}
            testName={testData.test.name}
            horseId={testData.horse.id}
            newid={testData.horse.newid}
            testDate={new Date().toISOString()}
          />

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              onClick={() => {
                setOtherExam("");
              }}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 
                      transition-all transform hover:scale-[1.02] ${
                        isSubmitting
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#1B4D3E] to-[#2A9D8F] text-white shadow-lg hover:shadow-xl"
                      }`}
            >
              {isSubmitting ? (
                <>
                  Enregistrement...
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </>
              ) : (
                <>
                  Enregistrer le Test
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

// Wrapper component to handle useSearchParams
function TestFormWrapper() {
  const searchParams = useSearchParams();
  return <TestForm searchParams={searchParams} />;
}

// Main component that wraps everything with Suspense
export default function DynamicTest() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <TestFormWrapper />
    </Suspense>
  );
}

export { TestForm };
