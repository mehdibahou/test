const express = require("express");
const router = express.Router();
const uploadController = require("../ExpressControllers/uploadController");
const path = require("path");
const fs = require("fs");
router.post("/upload", uploadController.uploadFile);

router.post("/deletefile", async (req, res) => {
  try {
    const { cleanPath } = req.body;

    // Delete the physical file
    const fullPath = path.join(__dirname, "../public/uploads", cleanPath);
    console.log(fullPath);
    await fs.promises.unlink(fullPath);

    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting file",
      error: error.message,
    });
  }
});
module.exports = router;
