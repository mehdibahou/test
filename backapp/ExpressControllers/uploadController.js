// backend/controllers/uploadController.js
const { writeFile, mkdir } = require("fs/promises");
const { join } = require("path");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    // Add file type validation
    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Allowed types: PDF, JPG, PNG, DOC, DOCX")
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

// Helper function to create safe folder name
function createSafeFolderName(str) {
  return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

// Helper function to get file extension
function getFileExtension(filename) {
  return path.extname(filename);
}

// Upload prophylaxie document - for detail PDFs
exports.uploadProphylaxieDocument = [
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      let { fileName, horseId, newid, folderName, dateStr } = req.body;

      if (!file || !horseId) {
        return res.status(400).json({
          success: false,
          error: "Missing required file or horse ID",
        });
      }
      console.log("Horse ID:", horseId);
      console.log("New ID:", fileName);
      console.log("Folder Name:", folderName);
      console.log("Date:", dateStr);
      if (!fileName) {
        fileName = `document_${dateStr}`;
      }

      // Build the upload path for prophylaxie detail documents
      // Use folderName if provided, otherwise use "documents" as default
      const folder = folderName || "documents";

      const uploadDir = join(
        process.cwd(),
        "public",
        "uploads",
        "horses",
        newid || horseId,
        "prophylaxie",
        folder
      );

      // Create directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });

      // Use the provided fileName with the original file extension
      const fileNameWithExt = `${fileName}`;

      // Full path for file
      const filePath = join(uploadDir, fileNameWithExt);

      // Write file to disk
      await writeFile(filePath, file.buffer);

      // Return the relative path for database storage
      const relativePath = `/uploads/horses/${
        newid || horseId
      }/prophylaxie/${folder}/${fileNameWithExt}`;

      res.json({
        success: true,
        path: relativePath,
        fileName: fileNameWithExt,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: "Error uploading document",
        details: error.message,
      });
    }
  },
];

// Update an existing prophylaxie document by directly overwriting the file
exports.updateProphylaxieDocument = [
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      let { filePath, horseId } = req.body;

      if (!file || !filePath) {
        return res.status(400).json({
          success: false,
          error: "Missing required file or original file path",
        });
      }

      console.log("Updating file path:", filePath);

      // Make sure filePath starts with a forward slash
      const relativePath = filePath.startsWith("/") ? filePath : `/${filePath}`;

      // Convert the relative path to an absolute path in the file system
      const fullFilePath = join(process.cwd(), "public", relativePath);

      // Get the directory path (without the filename)
      const fileDir = path.dirname(fullFilePath);

      console.log("Full file path:", fullFilePath);
      console.log("Directory path:", fileDir);

      // Ensure the directory exists
      await mkdir(fileDir, { recursive: true });

      // Write the new file to the same location, overwriting the old one
      await writeFile(fullFilePath, file.buffer);

      res.json({
        success: true,
        path: relativePath,
        fileName: path.basename(fullFilePath),
        message: "File successfully updated at original location",
      });
    } catch (error) {
      console.error("File update error:", error);
      res.status(500).json({
        success: false,
        error: "Error updating document",
        details: error.message,
      });
    }
  },
];

// Regular file upload for test documents
exports.uploadFile = [
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;
      let { fileName, testName, date, horseId, newid } = req.body;

      if (!fileName) {
        fileName = testName;
      }

      if (!file || !testName || !date || !horseId) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required file, file name, test name, date, or horse ID",
        });
      }

      // Create test folder name from test name and date
      const testFolderName =
        createSafeFolderName(testName) +
        "_" +
        new Date(date).toISOString().split("T")[0];

      // Create the folder structure: /uploads/horses/horseId/tests/testName_date
      const uploadDir = join(
        process.cwd(),
        "public",
        "uploads",
        "horses",
        newid || horseId,
        "tests",
        testFolderName
      );

      // Create directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true });

      // Use the provided fileName with the original file extension
      const fileNameWithExt = `${fileName}${getFileExtension(
        file.originalname
      )}`;

      // Full path for file
      const filePath = join(uploadDir, fileNameWithExt);

      // Write file to disk
      await writeFile(filePath, file.buffer);

      // Return the relative path for database storage
      const relativePath = `/uploads/horses/${
        newid || horseId
      }/tests/${testFolderName}/${fileNameWithExt}`;

      res.json({
        success: true,
        path: relativePath,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        success: false,
        error: "Error uploading file",
      });
    }
  },
];

// Middleware for handling file uploads
exports.uploadMiddleware = upload;
