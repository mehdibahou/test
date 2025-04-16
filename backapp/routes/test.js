const express = require("express");
const router = express.Router();
const testController = require("../ExpressControllers/testController");

router.post("/test", testController.createTest);
router.get("/test", testController.getTests);
router.get("/horse-test", testController.getLatestTests);
router.delete("/test/:id", testController.deleteTest);
router.get("/test-types", testController.getTestTypes);
router.put("/test/:id", testController.updateTest);
router.get("/onetest/:id", testController.getTestById);

module.exports = router;
