const { Test } = require("../models/test");
const { Prophylaxie } = require("../models/prophylaxie");
const { Horse } = require("../models/horse");

// Get all events (tests and prophylaxies) with dateRappel
exports.getAllEvents = async (req, res) => {
  try {
    const { month, year } = req.query;

    // Set default to current month/year if not provided
    const currentDate = new Date();
    const eventMonth = month ? parseInt(month) : currentDate.getMonth();
    const eventYear = year ? parseInt(year) : currentDate.getFullYear();

    // Create date range for the specified month
    const startDate = new Date(eventYear, eventMonth, 1);
    const endDate = new Date(eventYear, eventMonth + 1, 0, 23, 59, 59);

    // Fetch tests with dateRappel in the specified month
    const testsWithRappel = await Test.find({
      dateRappel: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "horse",
        select: "name matricule race discipline horseId",
      })
      .lean();

    // Fetch prophylaxies with dateRappel in the specified month
    const prophylaxiesWithRappel = await Prophylaxie.find({
      dateRappel: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "horse",
        select: "name matricule race discipline horseId",
      })
      .lean();

    // Format test events
    const testEvents = testsWithRappel.map((test) => ({
      id: test._id,
      type: "test",
      title: `Suivi: ${test.type}`,
      date: test.dateRappel,
      horse: test.horse,
      details: {
        type: test.type,
        diagnostiques: test.diagnostiques,
        traitements: test.traitements,
        username: test.username || "Non spécifié",
      },
    }));

    // Format prophylaxie events
    const prophylaxieEvents = prophylaxiesWithRappel.map((prophylaxie) => ({
      id: prophylaxie._id,
      type: "prophylaxie",
      title: `Prophylaxie: ${prophylaxie.type}`,
      date: prophylaxie.dateRappel,
      horse: prophylaxie.horse,
      details: {
        type: prophylaxie.type,
        notes: prophylaxie.notes,
        details: prophylaxie.details,
      },
    }));

    // Combine and sort all events by date
    const allEvents = [...testEvents, ...prophylaxieEvents].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Group events by date
    const eventsByDate = allEvents.reduce((acc, event) => {
      const dateStr = new Date(event.date).toISOString().split("T")[0];
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(event);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        events: allEvents,
        eventsByDate,
        count: allEvents.length,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      error: "Error retrieving events",
      message: error.message,
    });
  }
};

// Get events for a specific date
exports.getEventsByDate = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date parameter is required",
      });
    }

    // Create date range for the specified date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Fetch tests with dateRappel on the specified date
    const testsWithRappel = await Test.find({
      dateRappel: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "horse",
        select: "name matricule race discipline horseId etat",
      })
      .lean();

    // Fetch prophylaxies with dateRappel on the specified date
    const prophylaxiesWithRappel = await Prophylaxie.find({
      dateRappel: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: "horse",
        select: "name matricule race discipline horseId etat",
      })
      .lean();

    // Format test events
    const testEvents = testsWithRappel.map((test) => ({
      id: test._id,
      type: "test",
      title: `Suivi: ${test.type}`,
      date: test.dateRappel,
      horse: test.horse,
      details: {
        type: test.type,
        diagnostiques: test.diagnostiques,
        traitements: test.traitements,
        pronostic: test.pronostic,
        username: test.username || "Non spécifié",
        dateInitiale: test.date,
      },
    }));

    // Format prophylaxie events
    const prophylaxieEvents = prophylaxiesWithRappel.map((prophylaxie) => ({
      id: prophylaxie._id,
      type: "prophylaxie",
      title: `Prophylaxie: ${prophylaxie.type}`,
      date: prophylaxie.dateRappel,
      horse: prophylaxie.horse,
      details: {
        type: prophylaxie.type,
        notes: prophylaxie.notes,
        details: prophylaxie.details,
        dateInitiale: prophylaxie.date,
      },
    }));

    // Combine all events
    const allEvents = [...testEvents, ...prophylaxieEvents].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.status(200).json({
      success: true,
      data: allEvents,
      count: allEvents.length,
    });
  } catch (error) {
    console.error("Error fetching events for date:", error);
    res.status(500).json({
      success: false,
      error: "Error retrieving events",
      message: error.message,
    });
  }
};
