// routes/mutation.js
const express = require("express");
const router = express.Router();
const mutationController = require("../ExpressControllers/mutationController");

// Route pour muter un cheval
router.post("/horse/:id/mutate", mutationController.mutateHorse);

// Route pour obtenir tous les chevaux mutés
router.get("/mutated-horses", mutationController.getMutatedHorses);

// Route pour obtenir les détails de mutation d'un cheval spécifique
router.get(
  "/horse/:id/mutation-details",
  mutationController.getMutationDetails
);

// Route pour annuler une mutation (défaire la mutation)
router.post("/horse/:id/cancel-mutation", mutationController.cancelMutation);

module.exports = router;
