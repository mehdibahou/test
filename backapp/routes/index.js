// routes/index.js - Updated with dashboard routes
const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const horseRoutes = require("./horse");
const performanceRoutes = require("./performance");
const testRoutes = require("./test");
const uploadRoutes = require("./upload");
const dashboardRoutes = require("./dashboard");
const prophylaxieRoutes = require("./prophylaxie");
const radiationRoutes = require("./radiation");
const mutationRoutes = require("./mutation");
const eventRoutes = require("./event");

router.use("/", authRoutes);
router.use("/", horseRoutes);
router.use("/", performanceRoutes);
router.use("/", testRoutes);
router.use("/", uploadRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/", prophylaxieRoutes);
router.use("/", radiationRoutes);
router.use("/", mutationRoutes);
router.use("/", eventRoutes);

module.exports = router;
