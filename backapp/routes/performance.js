// routes/performance.js
const express = require("express");
const router = express.Router();
const performanceController = require("../ExpressControllers/performanceController");

// Create a new performance
router.post("/performance", performanceController.createPerformance);

// Get performances with optional filtering
router.get("/performance", performanceController.getPerformances);

// Get latest performances for dashboard
router.get("/horse-perf", performanceController.getLatestPerformances);

// Get a single performance by ID
router.get("/performance/:id", performanceController.getPerformanceById);

// Update a performance
router.put("/performance/:id", performanceController.updatePerformance);

// Delete a performance
router.delete("/performance/:id", performanceController.deletePerformance);

module.exports = router;
