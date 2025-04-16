import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Upload, X, File, Image } from "lucide-react";

const FileUploadSection = forwardRef(
  ({ testName, horseId, testDate, initialFile, newid }, ref) => {
    console.log(initialFile);
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [existingFiles, setExistingFiles] = useState([]);

    // Handle initial files when component mounts or when initialFile changes
    useEffect(() => {
      console.log("initialFile received:", initialFile);
      if (Array.isArray(initialFile) && initialFile.length > 0) {
        // Extract just the filename (without path) for display
        const fileObjects = initialFile.map((filePath, index) => {
          const fileName = filePath.split("/").pop();
          return {
            id: `existing-${index + 1}`,
            name: fileName,
            path: filePath,
          };
        });

        setExistingFiles(fileObjects);
        console.log("Existing files set:", fileObjects.length);
      } else {
        setExistingFiles([]);
        console.log("No initialFile or empty array");
      }
    }, [initialFile]); // Only re-run when initialFile changes

    const handleFiles = (fileList) => {
      const newFiles = Array.from(fileList).map((file) => {
        // Create a safe filename by removing special characters and extension
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

    const removeExistingFile = async (id, filePath) => {
      try {
        const BASE_URL = "http://localhost:3001/api";
        const cleanPath = filePath.replace("/uploads/", "");

        // Call API to delete the physical file
        const deleteResponse = await fetch(`${BASE_URL}/deletefile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cleanPath }),
        });

        if (!deleteResponse.ok) {
          const error = await deleteResponse.json();
          throw new Error(error.message || "Failed to delete file");
        }

        // Update the local state to remove the file reference
        setExistingFiles(existingFiles.filter((file) => file.id !== id));
      } catch (error) {
        console.error("Error deleting file:", error);
        // alert("Erreur lors de la suppression du fichier");
      }
    };

    const updateFileName = (id, newName) => {
      const safeName = newName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      setFiles(
        files.map((file) =>
          file.id === id ? { ...file, name: safeName } : file
        )
      );
    };

    const hasFiles = () => {
      return files.length > 0 || existingFiles.length > 0;
    };

    const uploadFiles = async () => {
      console.log("Starting uploadFiles with horseId:", horseId);

      if (!horseId) {
        return { success: false, error: "ID du cheval manquant" };
      }

      if (files.length === 0) {
        // If no new files but we have existing files, return those
        if (existingFiles.length > 0) {
          return {
            success: true,
            files: existingFiles.map((file) => ({
              name: file.name,
              path: file.path,
            })),
          };
        }
        console.log("No files to upload");
        return { success: true, files: [] };
      }

      setIsUploading(true);
      const uploadedFiles = [...existingFiles]; // Include existing files

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
        hasFiles,
      }),
      [files, existingFiles, horseId, testName, testDate, newid]
    );

    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold text-[#1B4D3E] mb-6">Fichiers</h2>

        {/* Existing Files Section */}
        {existingFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Fichiers existants ({existingFiles.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingFiles.map((file) => (
                <div key={file.id} className="relative group">
                  {file.path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={`http://localhost:3001${file.path}`}
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        console.error("Image failed to load:", file.path);
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
                      }}
                    />
                  ) : (
                    <div className="w-full h-32 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                      {file.path.match(/\.pdf$/i) ? (
                        <a
                          href={`http://localhost:3001${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center w-full h-full"
                        >
                          <File className="w-8 h-8 text-[#1B4D3E] mb-2" />
                          <span className="text-gray-500 text-center px-2 break-words">
                            {file.name}
                          </span>
                        </a>
                      ) : (
                        <>
                          <File className="w-8 h-8 text-[#1B4D3E] mb-2" />
                          <span className="text-gray-500 text-center px-2 break-words">
                            {file.name}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center text-center p-2">
                    <span className="text-sm mb-2 break-words max-w-full">
                      {file.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeExistingFile(file.id, file.path);
                      }}
                      className="p-1 bg-red-500 rounded-full"
                      title="Supprimer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              Fichiers à télécharger ({files.length})
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

        {/* Preview Grid for new files */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-[#1B4D3E] mb-3">
              Aperçu des images
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

        {isUploading && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
            <p className="text-center">Téléchargement en cours...</p>
          </div>
        )}
      </div>
    );
  }
);

FileUploadSection.displayName = "FileUploadSection";

export default FileUploadSection;
