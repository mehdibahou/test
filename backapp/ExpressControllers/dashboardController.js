// controllers/dashboardController.js
const { Horse } = require("../models/horse");
const { Test } = require("../models/test");

exports.getDashboardStats = async (req, res) => {
  try {
    // Get total horses count (excluding radiated horses)
    const totalHorses = await Horse.countDocuments({ isRadie: { $ne: true } });
    console.log("totalHorses", totalHorses);

    // Get radiated horses count
    const radiatedHorses = await Horse.countDocuments({ isRadie: true });
    console.log("radiatedHorses", radiatedHorses);

    // Get radiation motif distribution
    const radiationDistribution = await Horse.aggregate([
      { $match: { isRadie: true } },
      {
        $group: {
          _id: "$motifderadiation",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    console.log("radiationDistribution", radiationDistribution);

    // Get health statistics (excluding radiated horses)
    const healthStats = await Horse.aggregate([
      { $match: { isRadie: { $ne: true } } },
      {
        $group: {
          _id: null,
          maladies: {
            $sum: {
              $cond: [{ $eq: ["$etat", "malade"] }, 1, 0],
            },
          },
          retablissement: {
            $sum: {
              $cond: [{ $eq: ["$etat", "en rétablissement"] }, 1, 0],
            },
          },
          sains: {
            $sum: {
              $cond: [{ $eq: ["$etat", "sain"] }, 1, 0],
            },
          },
        },
      },
    ]);
    console.log("healthStats", healthStats);

    // Get race distribution (excluding radiated horses)
    const raceDistribution = await Horse.aggregate([
      { $match: { isRadie: { $ne: true } } },
      {
        $group: {
          _id: "$race",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    console.log("raceDistribution", raceDistribution);

    // Get robe distribution (excluding radiated horses)
    const robeDistribution = await Horse.aggregate([
      { $match: { isRadie: { $ne: true } } },
      {
        $group: {
          _id: "$robe",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    console.log("robeDistribution", robeDistribution);

    // Get discipline distribution (excluding radiated horses)
    const disciplineDistribution = await Horse.aggregate([
      { $match: { isRadie: { $ne: true } } },
      {
        $group: {
          _id: "$discipline",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    console.log("disciplineDistribution", disciplineDistribution);

    // Get common pathologies (excluding radiated horses' tests)
    const pathologies = await Test.aggregate([
      // Join with horses to filter out radiated horses' tests
      {
        $lookup: {
          from: "horses",
          localField: "horse",
          foreignField: "_id",
          as: "horseDetails",
        },
      },
      { $unwind: "$horseDetails" },
      {
        $match: {
          "horseDetails.isRadie": { $ne: true },
          isRadie: { $ne: true },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);
    console.log("pathologies", pathologies);

    // Create total radiation ratio
    const totalHorsesIncludingRadiated = totalHorses + radiatedHorses;
    const radiationRatio =
      totalHorsesIncludingRadiated > 0
        ? ((radiatedHorses / totalHorsesIncludingRadiated) * 100).toFixed(1)
        : 0;

    const healthStatsData = healthStats[0] || {
      maladies: 0,
      retablissement: 0,
      sains: 0,
    };

    res.status(200).json({
      success: true,
      data: {
        totalHorses,
        healthStats: healthStatsData,
        raceDistribution,
        robeDistribution,
        disciplineDistribution,
        pathologies,
        radiationStats: {
          radiatedHorses,
          radiationRatio,
          radiationDistribution,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
