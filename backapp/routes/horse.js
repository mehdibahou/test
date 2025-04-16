// routes/horse.js
const express = require("express");
const router = express.Router();
const horseController = require("../ExpressControllers/horseController");

// Basic routes
router.post("/horse", horseController.addHorse);
router.get("/horse", horseController.getHorses);

// Category route (must come before :id routes)
router.get("/horse/category/:category", horseController.getHorsesByCategory);

// Individual horse routes
router.get("/horse/:id", horseController.getHorseById);
router.get("/horses/:id/basic", horseController.getHorseBasicDetails);
router.patch("/horse/:id", horseController.updateHorseState);
router.put("/horse/:id", horseController.updateHorse);
router.delete("/horse/:id", horseController.deleteHorse);

module.exports = router;
