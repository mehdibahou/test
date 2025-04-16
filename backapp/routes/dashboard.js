// routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../ExpressControllers/dashboardController');

router.get('/', dashboardController.getDashboardStats);

module.exports = router;

