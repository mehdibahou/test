// controllers/performanceController.js
const { Performance } = require("../models/performance");
const { Horse } = require("../models/horse");
const mongoose = require("mongoose");

exports.getPerformances = async (req, res) => {
  try {
    console.log("=== Starting getPerformances ===");
    console.log("Request URL:", req.url);

    // Extract query parameters
    const {
      horseId,
      horseQuery,
      startDate,
      endDate,
      competitionType,
      competitionName,
      epreuve,
      lieu,
      height,
      result,
      rider,
      // Horse-specific filters
      etat,
      race,
      robe,
      discipline,
      ageRange,
      pere,
      mere,
      taille,
      provenance,
      detachement,
    } = req.query;

    console.log("Query Parameters:", {
      horseId,
      horseQuery,
      startDate,
      endDate,
      competitionType,
      competitionName,
      epreuve,
      lieu,
      height,
      result,
      rider,
      etat,
      race,
      robe,
      discipline,
      ageRange,
      pere,
      mere,
      taille,
      provenance,
      detachement,
    });

    // First, find matching horses based on horse-specific filters
    let matchingHorseIds = [];
    const hasHorseFilters =
      etat ||
      race ||
      robe ||
      discipline ||
      ageRange ||
      pere ||
      mere ||
      taille ||
      provenance ||
      detachement;

    if (hasHorseFilters || horseQuery) {
      console.log("Processing horse-specific filters...");

      // Build horse query
      const horseQueryObj = {};

      if (etat) horseQueryObj.etat = etat;
      if (race) horseQueryObj.race = race;
      if (robe) horseQueryObj.robe = robe;
      if (discipline) horseQueryObj.discipline = discipline;

      // Handle age range filter
      if (ageRange) {
        const today = new Date();
        let minAge = 0;
        let maxAge = 100;

        switch (ageRange) {
          case "0-4":
            minAge = 0;
            maxAge = 4;
            break;
          case "5-7":
            minAge = 5;
            maxAge = 7;
            break;
          case "8-12":
            minAge = 8;
            maxAge = 12;
            break;
          case "13-15":
            minAge = 13;
            maxAge = 15;
            break;
          case "16-18":
            minAge = 16;
            maxAge = 18;
            break;
          case "18-20":
            minAge = 18;
            maxAge = 20;
            break;
          case ">20":
            minAge = 21;
            break;
        }

        // Calculate birth date range based on age
        const maxBirthDate = new Date(today);
        maxBirthDate.setFullYear(today.getFullYear() - minAge);

        const minBirthDate = new Date(today);
        minBirthDate.setFullYear(today.getFullYear() - maxAge - 1);
        minBirthDate.setDate(minBirthDate.getDate() + 1);

        horseQueryObj.birthDate = {
          $gte: minBirthDate,
          $lte: maxBirthDate,
        };
      }

      // Handle parent filters - need to check both ObjectId and text fields
      if (pere) {
        horseQueryObj.$or = horseQueryObj.$or || [];
        horseQueryObj.$or.push({ "father.name": pere }, { fatherText: pere });
      }

      if (mere) {
        horseQueryObj.$or = horseQueryObj.$or || [];
        horseQueryObj.$or.push({ "mother.name": mere }, { motherText: mere });
      }

      // Handle other property filters
      if (taille) horseQueryObj.Taille = taille;
      if (provenance) horseQueryObj.Provenance = provenance;
      if (detachement) horseQueryObj.Detachement = detachement;

      // Add text search if provided
      if (horseQuery) {
        try {
          const searchRegex = new RegExp(
            horseQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
            "i"
          );
          horseQueryObj.$or = horseQueryObj.$or || [];
          horseQueryObj.$or.push(
            { name: searchRegex },
            { matricule: searchRegex }
          );
        } catch (regexError) {
          console.error("Error in horse search:", regexError);
        }
      }

      console.log("Horse query:", JSON.stringify(horseQueryObj, null, 2));

      // Find matching horses
      const matchingHorses = await Horse.find(horseQueryObj).select("_id");
      matchingHorseIds = matchingHorses.map((horse) => horse._id);

      console.log(`Found ${matchingHorseIds.length} matching horses`);

      if (matchingHorseIds.length === 0 && hasHorseFilters) {
        // If we have horse filters but no matching horses, return empty result
        return res.json({
          success: true,
          data: [],
          message: "No horses match the specified criteria",
        });
      }
    }

    // Initialize performance query object
    let performanceQuery = {};

    // Handle horse filtering
    if (horseId) {
      console.log("Using horseId:", horseId);
      performanceQuery.horse = new mongoose.Types.ObjectId(horseId);
    } else if (matchingHorseIds.length > 0) {
      // Use the matching horses from our filters
      performanceQuery.horse = {
        $in: matchingHorseIds,
      };
    }

    // Add date range filters if provided
    if (startDate || endDate) {
      console.log("Processing date filters");
      performanceQuery.date = {};

      if (startDate) {
        console.log("Processing start date:", startDate);
        const startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid start date format",
          });
        }
        performanceQuery.date.$gte = startDateObj;
      }

      if (endDate) {
        console.log("Processing end date:", endDate);
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          return res.status(400).json({
            success: false,
            error: "Invalid end date format",
          });
        }
        performanceQuery.date.$lte = endDateObj;
      }
    }

    // Add filters for performance-specific properties
    if (competitionType) {
      console.log("Processing competition type filter:", competitionType);
      performanceQuery.competitionType = competitionType;
    }

    if (competitionName) {
      console.log("Processing competition name filter:", competitionName);
      performanceQuery.competitionName = competitionName;
    }

    if (epreuve) {
      console.log("Processing epreuve filter:", epreuve);
      performanceQuery.epreuve = epreuve;
    }

    if (lieu) {
      console.log("Processing lieu filter:", lieu);
      performanceQuery.lieu = lieu;
    }

    if (height) {
      console.log("Processing height filter:", height);
      performanceQuery.height = height;
    }

    if (result) {
      console.log("Processing result filter:", result);
      performanceQuery.result = result;
    }

    if (rider) {
      console.log("Processing rider filter:", rider);
      performanceQuery.rider = rider;
    }

    console.log(
      "Final performance query:",
      JSON.stringify(performanceQuery, null, 2)
    );

    // Execute query with population and sorting
    console.log("Executing main query...");
    const performances = await Performance.find(performanceQuery)
      .populate("horse", "name matricule discipline")
      .sort({ date: -1 })
      .lean()
      .exec();

    console.log(`Found ${performances.length} performances`);
    if (performances.length > 0) {
      console.log(
        "Sample performance (first result):",
        JSON.stringify(performances[0], null, 2)
      );
    } else {
      console.log("No performances found");
      return res.json({
        success: true,
        data: [],
        message: "No performances found for the specified criteria",
        filters: {
          horse: horseId || null,
          dateRange: {
            start: startDate || null,
            end: endDate || null,
          },
          competitionType: competitionType || null,
          competitionName: competitionName || null,
          epreuve: epreuve || null,
          lieu: lieu || null,
          height: height || null,
          result: result || null,
          rider: rider || null,
          // Horse filters
          etat: etat || null,
          race: race || null,
          robe: robe || null,
          discipline: discipline || null,
          ageRange: ageRange || null,
          pere: pere || null,
          mere: mere || null,
          taille: taille || null,
          provenance: provenance || null,
          detachement: detachement || null,
        },
      });
    }

    console.log("Preparing successful response");
    res.json({
      success: true,
      data: performances,
      count: performances.length,
      filters: {
        horse: horseId || null,
        dateRange: {
          start: startDate || null,
          end: endDate || null,
        },
        competitionType: competitionType || null,
        competitionName: competitionName || null,
        epreuve: epreuve || null,
        lieu: lieu || null,
        height: height || null,
        result: result || null,
        rider: rider || null,
        // Horse filters
        etat: etat || null,
        race: race || null,
        robe: robe || null,
        discipline: discipline || null,
        ageRange: ageRange || null,
        pere: pere || null,
        mere: mere || null,
        taille: taille || null,
        provenance: provenance || null,
        detachement: detachement || null,
      },
    });
  } catch (error) {
    console.error("=== Error in getPerformances ===");
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Determine if it's a MongoDB connection error
    if (error.name === "MongooseError" || error.name === "MongoError") {
      console.error("MongoDB connection error detected");
      return res.status(503).json({
        success: false,
        error: "Database connection error",
        details: error.message,
      });
    }

    // Return generic error response
    console.error("Generic error detected");
    res.status(500).json({
      success: false,
      error: "Failed to fetch performances",
      details: error.message,
    });
  } finally {
    console.log("=== Finished getPerformances ===");
  }
};

exports.getLatestPerformances = async (req, res) => {
  try {
    // Extract filters
    const {
      competitionType,
      competitionName,
      epreuve,
      lieu,
      height,
      result,
      rider,
      // Horse filters
      etat,
      race,
      robe,
      discipline,
      ageRange,
      pere,
      mere,
      taille,
      provenance,
      detachement,
    } = req.query;

    // Build the aggregation pipeline
    const pipeline = [];

    // First, check if we need to filter by horse properties
    const hasHorseFilters =
      etat ||
      race ||
      robe ||
      discipline ||
      ageRange ||
      pere ||
      mere ||
      taille ||
      provenance ||
      detachement;

    // If we have horse filters, we need to look up horses first
    if (hasHorseFilters) {
      // First stage: Lookup to join horses
      pipeline.push({
        $lookup: {
          from: "horses",
          localField: "horse",
          foreignField: "_id",
          as: "horseDetails",
        },
      });

      // Unwind the array
      pipeline.push({ $unwind: "$horseDetails" });

      // Match stage for horse properties
      const horseMatchStage = { $match: {} };

      if (etat) horseMatchStage.$match["horseDetails.etat"] = etat;
      if (race) horseMatchStage.$match["horseDetails.race"] = race;
      if (robe) horseMatchStage.$match["horseDetails.robe"] = robe;
      if (discipline)
        horseMatchStage.$match["horseDetails.discipline"] = discipline;

      // Handle age range
      if (ageRange) {
        const today = new Date();
        let minAge = 0;
        let maxAge = 100;

        switch (ageRange) {
          case "0-4":
            minAge = 0;
            maxAge = 4;
            break;
          case "5-7":
            minAge = 5;
            maxAge = 7;
            break;
          case "8-12":
            minAge = 8;
            maxAge = 12;
            break;
          case "13-15":
            minAge = 13;
            maxAge = 15;
            break;
          case "16-18":
            minAge = 16;
            maxAge = 18;
            break;
          case "18-20":
            minAge = 18;
            maxAge = 20;
            break;
          case ">20":
            minAge = 21;
            break;
        }

        // Calculate birth date range based on age
        const maxBirthDate = new Date(today);
        maxBirthDate.setFullYear(today.getFullYear() - minAge);

        const minBirthDate = new Date(today);
        minBirthDate.setFullYear(today.getFullYear() - maxAge - 1);
        minBirthDate.setDate(minBirthDate.getDate() + 1);

        horseMatchStage.$match["horseDetails.birthDate"] = {
          $gte: minBirthDate,
          $lte: maxBirthDate,
        };
      }

      // Handle parent filters with $or query for both ObjectId and text fields
      const orConditions = [];

      if (pere) {
        orConditions.push(
          { "horseDetails.father.name": pere },
          { "horseDetails.fatherText": pere }
        );
      }

      if (mere) {
        orConditions.push(
          { "horseDetails.mother.name": mere },
          { "horseDetails.motherText": mere }
        );
      }

      if (orConditions.length > 0) {
        horseMatchStage.$match.$or = orConditions;
      }

      // Add other property filters
      if (taille) horseMatchStage.$match["horseDetails.Taille"] = taille;
      if (provenance)
        horseMatchStage.$match["horseDetails.Provenance"] = provenance;
      if (detachement)
        horseMatchStage.$match["horseDetails.Detachement"] = detachement;

      // Add match stage to pipeline if we have any horse filters
      if (Object.keys(horseMatchStage.$match).length > 0) {
        pipeline.push(horseMatchStage);
      }
    } else {
      // If no horse filters, just do the regular lookup later
      pipeline.push({
        $lookup: {
          from: "horses",
          localField: "horse",
          foreignField: "_id",
          as: "horseDetails",
        },
      });

      pipeline.push({ $unwind: "$horseDetails" });
    }

    // Add performance-specific filters
    const performanceMatchStage = { $match: {} };

    if (competitionType)
      performanceMatchStage.$match.competitionType = competitionType;
    if (competitionName)
      performanceMatchStage.$match.competitionName = competitionName;
    if (epreuve) performanceMatchStage.$match.epreuve = epreuve;
    if (lieu) performanceMatchStage.$match.lieu = lieu;
    if (height) performanceMatchStage.$match.height = height;
    if (result) performanceMatchStage.$match.result = result;
    if (rider) performanceMatchStage.$match.rider = rider;

    // Add match stage to pipeline if we have any performance filters
    if (Object.keys(performanceMatchStage.$match).length > 0) {
      pipeline.push(performanceMatchStage);
    }

    // Sort by date (most recent first)
    pipeline.push({ $sort: { date: -1 } });

    // Project fields we want
    pipeline.push({
      $project: {
        _id: 1,
        date: 1,
        competitionType: 1,
        competitionName: 1,
        epreuve: 1,
        epreuveCustom: 1,
        lieu: 1,
        height: 1,
        result: 1,
        rider: 1,
        horseName: "$horseDetails.name",
        horseMatricule: "$horseDetails.matricule",
        horseDiscipline: "$horseDetails.discipline",
        // Add other useful fields for the frontend
        horseId: "$horseDetails._id",
        horseRace: "$horseDetails.race",
        horseRobe: "$horseDetails.robe",
        horseEtat: "$horseDetails.etat",
      },
    });

    console.log(
      "Executing aggregation pipeline:",
      JSON.stringify(pipeline, null, 2)
    );

    const performances = await Performance.aggregate(pipeline);

    res.json({
      data: performances,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching latest performances:", error);
    res.status(500).json({
      error: "Failed to fetch latest performances",
    });
  }
};

exports.createPerformance = async (req, res) => {
  try {
    const {
      horseId, // Horse's ObjectId or name (for lookup)
      date,
      competitionType,
      competitionName,
      epreuve,
      epreuveCustom,
      lieu,
      height,
      result,
      rider,
    } = req.body;
    console.log("Request body:", req.body);

    // If horseId is a name, look it up by name first
    let horse = null;
    if (!horseId.match(/^[0-9a-fA-F]{24}$/)) {
      horse = await Horse.findOne({ name: horseId });
      if (!horse) {
        return res.status(404).json({
          success: false,
          error: "Horse not found",
        });
      }
    } else {
      horse = await Horse.findById(horseId);
      if (!horse) {
        return res.status(404).json({
          success: false,
          error: "Horse not found",
        });
      }
    }

    // Validate required fields based on competition type
    if (competitionType === "CSO" && epreuve === "autre" && !epreuveCustom) {
      return res.status(400).json({
        success: false,
        error: "Custom epreuve is required when 'autre' is selected",
      });
    }

    if (competitionType === "Autre" && !competitionName) {
      return res.status(400).json({
        success: false,
        error: "Competition name is required when 'Autre' is selected",
      });
    }

    // Create the performance entry
    const newPerformance = new Performance({
      horse: horse._id,
      date,
      competitionType,
      competitionName:
        competitionType === "Autre" ? competitionName : undefined,
      epreuve: competitionType === "CSO" ? epreuve : undefined,
      epreuveCustom:
        competitionType === "CSO" && epreuve === "autre"
          ? epreuveCustom
          : undefined,
      lieu,
      height,
      result,
      rider,
    });

    await newPerformance.save();
    res.status(201).json({
      success: true,
      data: newPerformance,
    });
  } catch (error) {
    console.error("Error creating performance:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating performance with ID:", id);
    console.log("Request body:", req.body);

    const {
      horseId,
      date,
      competitionType,
      competitionName,
      epreuve,
      epreuveCustom,
      lieu,
      height,
      result,
      rider,
    } = req.body;

    // Validate performance ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid performance ID format",
      });
    }

    // Find performance to update
    const existingPerformance = await Performance.findById(id);
    if (!existingPerformance) {
      return res.status(404).json({
        success: false,
        error: "Performance not found",
      });
    }

    // Validate and find horse
    let horse = null;
    if (horseId) {
      if (!mongoose.Types.ObjectId.isValid(horseId)) {
        // If horseId is not a valid ObjectId, try to find by name
        horse = await Horse.findOne({ name: horseId });
      } else {
        horse = await Horse.findById(horseId);
      }

      if (!horse) {
        return res.status(404).json({
          success: false,
          error: "Horse not found",
        });
      }
    }

    // Validate required fields based on competition type
    if (competitionType === "CSO" && epreuve === "autre" && !epreuveCustom) {
      return res.status(400).json({
        success: false,
        error: "Custom epreuve is required when 'autre' is selected",
      });
    }

    if (competitionType === "Autre" && !competitionName) {
      return res.status(400).json({
        success: false,
        error: "Competition name is required when 'Autre' is selected",
      });
    }

    // Prepare update object
    const updateData = {
      ...(horse && { horse: horse._id }),
      ...(date && { date }),
      ...(competitionType && { competitionType }),
      ...(lieu && { lieu }),
      competitionName:
        competitionType === "Autre" ? competitionName : undefined,
      epreuve: competitionType === "CSO" ? epreuve : undefined,
      epreuveCustom:
        competitionType === "CSO" && epreuve === "autre"
          ? epreuveCustom
          : undefined,
      height, // Allow empty string to clear the field
      result, // Allow empty string to clear the field
      ...(rider && { rider }),
    };

    // Update the performance
    const updatedPerformance = await Performance.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    ).populate("horse", "name matricule discipline");

    res.json({
      success: true,
      data: updatedPerformance,
      message: "Performance updated successfully",
    });
  } catch (error) {
    console.error("Error updating performance:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update performance",
    });
  }
};

exports.getPerformanceById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching performance with ID:", id);

    // Validate performance ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid performance ID format",
      });
    }

    const performance = await Performance.findById(id)
      .populate("horse", "name matricule discipline")
      .lean();

    if (!performance) {
      return res.status(404).json({
        success: false,
        error: "Performance not found",
      });
    }

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    console.error("Error fetching performance by ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch performance",
    });
  }
};

exports.deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting performance with ID:", id);

    // Validate performance ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid performance ID format",
      });
    }

    const deletedPerformance = await Performance.findByIdAndDelete(id);

    if (!deletedPerformance) {
      return res.status(404).json({
        success: false,
        error: "Performance not found",
      });
    }

    res.json({
      success: true,
      message: "Performance deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting performance:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete performance",
    });
  }
};
