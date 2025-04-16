const express = require("express");
const router = express.Router();
const prophylaxieController = require("../ExpressControllers/prophylaxieController");
const uploadController = require("../ExpressControllers/uploadController");

// Prophylaxie routes
router.post("/prophylaxie", prophylaxieController.createProphylaxie);
router.get("/prophylaxie", prophylaxieController.getProphylaxies);
router.get("/horse-prophylaxie", prophylaxieController.getLatestProphylaxies);
router.delete("/prophylaxie/:id", prophylaxieController.deleteProphylaxie);
router.get("/prophylaxie-types", prophylaxieController.getProphylaxieTypes);
router.put("/prophylaxie/:id", prophylaxieController.updateProphylaxie);
router.get("/oneprophylaxie/:id", prophylaxieController.getProphylaxieById);

// Upload routes
router.post(
  "/upload-prophylaxie-document",
  uploadController.uploadProphylaxieDocument
);
router.post(
  "/update-prophylaxie-document",
  uploadController.updateProphylaxieDocument
);

module.exports = router;
