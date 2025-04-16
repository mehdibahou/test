const express = require("express");
const router = express.Router();
const eventController = require("../ExpressControllers/eventController");

// Get all events with dateRappel
router.get("/events", eventController.getAllEvents);

// Get events for a specific date
router.get("/events/:date", eventController.getEventsByDate);

module.exports = router;
