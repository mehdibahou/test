import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Upload, X, File, Image } from "lucide-react";

const FileUploadSection = forwardRef(
  ({ testName, horseId, testDate, newid }, ref) => {
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = (fileList) => {
      const newFiles = Array.from(fileList).map((file) => {
        // Create a safe filename by removing special characters
        const safeName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        return {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          file,
          originalName: file.name,
          name: safeName,
        };
      });

      setFiles([...files, ...newFiles]);
    };

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    };

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const removeFile = (id) => {
      setFiles(files.filter((file) => file.id !== id));
    };

    const updateFileName = (id, newName) => {
      const safeName = newName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      setFiles(
        files.map((file) =>
          file.id === id ? { ...file, name: safeName } : file
        )
      );
    };

    const uploadFiles = async () => {
      console.log("Starting uploadFiles with horseId:", horseId);

      if (!horseId) {
        return { success: false, error: "ID du cheval manquant" };
      }

      if (files.length === 0) {
        console.log("No files to upload");
        return { success: true, files: [] };
      }

      setIsUploading(true);
      const uploadedFiles = [];

      try {
        for (const fileItem of files) {
          console.log("Processing file:", fileItem.name);
          const formData = new FormData();
          formData.append("file", fileItem.file);
          formData.append("fileName", fileItem.name);
          formData.append("testName", testName);
          formData.append("horseId", horseId);
          formData.append("newid", newid);
          formData.append("date", testDate || new Date().toISOString());

          const BASE_URL = "http://localhost:3001/api";
          const response = await fetch(`${BASE_URL}/upload`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Erreur lors de l'upload de ${fileItem.name}`);
          }

          const data = await response.json();
          console.log("Upload response:", data);
          uploadedFiles.push({
            name: fileItem.name,
            path: data.path,
          });
        }

        console.log("All uploads completed:", uploadedFiles);
        setFiles([]); // Clear files after successful upload
        return { success: true, files: uploadedFiles };
      } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
      } finally {
        setIsUploading(false);
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        uploadFiles,
      }),
      [files, horseId, testName, testDate, newid]
    );

    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">Fichiers</h2>

        {/* Drag and drop area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all
            ${
              dragActive
                ? "border-[#1B4D3E] bg-[#1B4D3E]/10"
                : "border-gray-300"
            }
            ${
              isUploading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-[#1B4D3E] hover:bg-[#1B4D3E]/5"
            }
          `}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <Upload className="w-12 h-12 text-[#1B4D3E] mb-3" />
            <p className="text-lg font-medium text-[#1B4D3E]">
              Glissez-déposez vos fichiers ici ou cliquez pour parcourir
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Importez plusieurs fichiers à la fois
            </p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>

        {/* Files list */}
        {files.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-[#1B4D3E]">
              Fichiers à télécharger
            </h3>
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                {fileItem.file.type.startsWith("image/") ? (
                  <Image className="w-5 h-5 text-[#1B4D3E]" />
                ) : (
                  <File className="w-5 h-5 text-[#1B4D3E]" />
                )}

                <div className="flex-1">
                  <p className="text-sm text-gray-500 truncate">
                    {fileItem.originalName}
                  </p>
                  <input
                    type="text"
                    value={fileItem.name}
                    onChange={(e) =>
                      updateFileName(fileItem.id, e.target.value)
                    }
                    className="w-full px-2 py-1 mt-1 text-sm text-black rounded border border-gray-200 focus:border-[#1B4D3E] focus:ring-[#1B4D3E] focus:ring-1 outline-none transition-all"
                    placeholder="Nom du fichier"
                    disabled={isUploading}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(fileItem.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-[#1B4D3E] mb-3">
              Aperçu des images
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map(
                (fileItem) =>
                  fileItem.file.type.startsWith("image/") && (
                    <div key={fileItem.id} className="relative group">
                      <img
                        src={URL.createObjectURL(fileItem.file)}
                        alt={fileItem.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-center p-2">
                        <span className="text-sm">{fileItem.name}</span>
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileUploadSection.displayName = "FileUploadSection";

export default FileUploadSection;
