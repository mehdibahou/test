// routes/radiation.js
const express = require("express");
const router = express.Router();
const radiationController = require("../ExpressControllers/radiationController");

// Route to mark a horse as radiated
router.post("/horse/:id/radiate", radiationController.radiateHorse);

// Route to get all radiated horses
router.get("/radiated-horses", radiationController.getRadiatedHorses);

// Route to get radiation details for a specific horse
router.get(
  "/horse/:id/radiation-details",
  radiationController.getRadiationDetails
);

// Route to cancel a radiation (undo radiation)
router.post("/horse/:id/cancel-radiation", radiationController.cancelRadiation);

module.exports = router;
