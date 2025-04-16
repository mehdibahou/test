const { Test } = require("../models/test");
const { Horse } = require("../models/horse");
const fs = require("fs/promises");
const path = require("path");

// Create Test
exports.createTest = async (req, res) => {
  try {
    const {
      horseId,
      type,
      date,
      dateDeGuerison,
      dateRappel, // Added dateRappel field
      username, // Added username field
      anamnese,
      examenClinique,
      examensComplementaires,
      diagnostiques,
      traitements,
      pronostic,
      file,
      createdBy,
    } = req.body;

    // Validate horse exists
    const horse = await Horse.findById(horseId);
    if (!horse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Validate and format examensComplementaires
    const formattedExamens = examensComplementaires.map((exam) => ({
      name: exam.name,
      checked: exam.checked ?? true,
      comment: exam.comment ?? "",
    }));

    const newTest = new Test({
      horse: horseId,
      type,
      date,
      dateDeGuerison,
      dateRappel, // Added dateRappel field
      username, // Added username field
      anamnese,
      examenClinique,
      examensComplementaires: formattedExamens,
      diagnostiques,
      traitements,
      pronostic,
      file,
      createdBy,
    });

    await newTest.save();

    res.status(201).json({
      success: true,
      data: newTest,
    });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Tests with advanced horse filters
exports.getTests = async (req, res) => {
  try {
    const {
      horseId,
      startDate,
      endDate,
      type,
      // Horse-specific filters
      etat,
      race,
      robe,
      discipline,
      ageRange,
      pere,
      mere,
      taille,
      puce,
      provenance,
      detachement,
    } = req.query;

    console.log("Query parameters:", req.query);

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
      puce ||
      provenance ||
      detachement;

    if (hasHorseFilters) {
      console.log("Processing horse-specific filters...");

      // Build horse query
      const horseQuery = {};

      if (etat) horseQuery.etat = etat;
      if (race) horseQuery.race = race;
      if (robe) horseQuery.robe = robe;
      if (discipline) horseQuery.discipline = discipline;

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

        horseQuery.birthDate = {
          $gte: minBirthDate,
          $lte: maxBirthDate,
        };
      }

      // Handle parent filters - need to check both ObjectId and text fields
      if (pere) {
        horseQuery.$or = horseQuery.$or || [];
        horseQuery.$or.push({ "father.name": pere }, { fatherText: pere });
      }

      if (mere) {
        horseQuery.$or = horseQuery.$or || [];
        horseQuery.$or.push({ "mother.name": mere }, { motherText: mere });
      }

      // Handle other property filters
      if (taille) horseQuery.Taille = taille;
      if (puce) horseQuery.Puce = puce;
      if (provenance) horseQuery.Provenance = provenance;
      if (detachement) horseQuery.Detachement = detachement;

      console.log("Horse query:", JSON.stringify(horseQuery, null, 2));

      // Find matching horses
      const matchingHorses = await Horse.find(horseQuery).select("_id");
      matchingHorseIds = matchingHorses.map((horse) => horse._id);

      console.log(`Found ${matchingHorseIds.length} matching horses`);

      if (matchingHorseIds.length === 0 && hasHorseFilters) {
        // If we have horse filters but no matching horses, return empty result
        return res.status(200).json({
          success: true,
          data: [],
          message: "No horses match the specified criteria",
        });
      }
    }

    // Build the test query
    const query = {};

    // Add horse filter (either specific horse or horses matching criteria)
    if (horseId) {
      query.horse = horseId;
    } else if (matchingHorseIds.length > 0) {
      query.horse = { $in: matchingHorseIds };
    }

    // Add date range filters
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Add test type filter
    if (type) {
      query.type = type;
    }

    console.log("Final test query:", JSON.stringify(query, null, 2));

    // Execute the query
    const tests = await Test.find(query)
      .populate("horse", "name matricule race discipline")
      .sort({ date: -1 })
      .lean();

    console.log(`Found ${tests.length} tests matching criteria`);

    res.status(200).json({
      success: true,
      data: tests,
      count: tests.length,
      filters: {
        horse: horseId || null,
        dateRange: {
          start: startDate || null,
          end: endDate || null,
        },
        type: type || null,
        // Horse filters
        etat: etat || null,
        race: race || null,
        robe: robe || null,
        discipline: discipline || null,
        ageRange: ageRange || null,
        pere: pere || null,
        mere: mere || null,
        taille: taille || null,
        puce: puce || null,
        provenance: provenance || null,
        detachement: detachement || null,
      },
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Latest Tests with advanced filters
exports.getLatestTests = async (req, res) => {
  try {
    const totalCount = await Test.countDocuments();
    console.log("Total tests in database:", totalCount);

    // Extract filters
    const {
      type,
      // Horse filters
      etat,
      race,
      robe,
      discipline,
      ageRange,
      pere,
      mere,
      taille,
      puce,
      provenance,
      detachement,
    } = req.query;

    const hasHorseFilters =
      etat ||
      race ||
      robe ||
      discipline ||
      ageRange ||
      pere ||
      mere ||
      taille ||
      puce ||
      provenance ||
      detachement;

    // Build the aggregation pipeline
    const pipeline = [];

    // First filter by test type if provided
    if (type) {
      pipeline.push({ $match: { type } });
    }

    // Sort by date (most recent first)
    pipeline.push({ $sort: { date: -1 } });

    // Lookup to join with horses collection
    pipeline.push({
      $lookup: {
        from: "horses",
        localField: "horse",
        foreignField: "_id",
        as: "horseDetails",
      },
    });

    // Handle empty horseDetails with fallback
    pipeline.push({
      $addFields: {
        horseDetails: {
          $cond: {
            if: { $eq: [{ $size: "$horseDetails" }, 0] },
            then: [{ name: "Unknown", matricule: "Unknown" }],
            else: "$horseDetails",
          },
        },
      },
    });

    // Unwind the horseDetails array
    pipeline.push({ $unwind: "$horseDetails" });

    // Apply horse-specific filters if needed
    if (hasHorseFilters) {
      const horseFilterMatch = { $match: {} };

      if (etat) horseFilterMatch.$match["horseDetails.etat"] = etat;
      if (race) horseFilterMatch.$match["horseDetails.race"] = race;
      if (robe) horseFilterMatch.$match["horseDetails.robe"] = robe;
      if (discipline)
        horseFilterMatch.$match["horseDetails.discipline"] = discipline;

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

        horseFilterMatch.$match["horseDetails.birthDate"] = {
          $gte: minBirthDate,
          $lte: maxBirthDate,
        };
      }

      // Handle parent filters
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
        horseFilterMatch.$match.$or = orConditions;
      }

      // Add other property filters
      if (taille) horseFilterMatch.$match["horseDetails.Taille"] = taille;
      if (puce) horseFilterMatch.$match["horseDetails.Puce"] = puce;
      if (provenance)
        horseFilterMatch.$match["horseDetails.Provenance"] = provenance;
      if (detachement)
        horseFilterMatch.$match["horseDetails.Detachement"] = detachement;

      // Add the horse filter match stage if we have any filters
      if (Object.keys(horseFilterMatch.$match).length > 0) {
        pipeline.push(horseFilterMatch);
      }
    }

    // Project the final fields we want
    pipeline.push({
      $project: {
        _id: 1,
        date: 1,
        dateDeGuerison: 1,
        dateRappel: 1, // Include dateRappel field
        username: 1, // Include username field
        type: 1,
        anamnese: 1,
        updatedAt: 1,
        examenClinique: 1,
        examensComplementaires: {
          $map: {
            input: "$examensComplementaires",
            as: "exam",
            in: {
              name: "$$exam.name",
              checked: { $ifNull: ["$$exam.checked", true] },
              comment: { $ifNull: ["$$exam.comment", ""] },
            },
          },
        },
        diagnostiques: 1,
        traitements: 1,
        pronostic: 1,
        createdBy: 1,
        file: 1,
        horse: {
          _id: "$horseDetails._id",
          name: "$horseDetails.name",
          matricule: "$horseDetails.matricule",
          race: "$horseDetails.race",
          discipline: "$horseDetails.discipline",
        },
      },
    });

    console.log(
      "Executing aggregation pipeline:",
      JSON.stringify(pipeline, null, 2)
    );

    const tests = await Test.aggregate(pipeline);

    console.log(`Found ${tests.length} tests after aggregation`);

    res.json({
      data: tests,
      success: true,
      count: tests.length,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching latest tests:", error);
    res.status(500).json({
      error: "Failed to fetch latest tests",
    });
  }
};

// Delete Test
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findById(id).populate("horse", "_id");

    if (!test) {
      return res.status(404).json({
        success: false,
        error: "Test not found",
      });
    }

    // Handle file deletion if files exist
    if (test.file && test.file.length > 0) {
      try {
        // Get the file path by removing everything after the last '/'
        const filePath = test.file[0];
        const lastSlashIndex = filePath.lastIndexOf("/");
        const folderPath = filePath.substring(0, lastSlashIndex);

        const fullFolderPath = path.join(process.cwd(), "public", folderPath);

        // Check if folder exists before attempting to remove
        if (
          await fs
            .access(fullFolderPath)
            .then(() => true)
            .catch(() => false)
        ) {
          await fs.rm(fullFolderPath, { recursive: true, force: true });
          console.log(`Successfully removed test folder: ${fullFolderPath}`);
        }
      } catch (dirError) {
        console.error(`Error removing test folder:`, dirError);
      }
    }

    await Test.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Test and associated folder deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting test:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Test Types
exports.getTestTypes = async (req, res) => {
  try {
    const types = await Test.distinct("type");
    const sortedTypes = types
      .filter((type) => type && type.trim())
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      data: sortedTypes,
    });
  } catch (error) {
    console.error("Error fetching test types:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update Test
exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      horseId,
      type,
      date,
      dateDeGuerison,
      dateRappel, // Added dateRappel field
      username, // Added username field
      anamnese,
      examenClinique,
      examensComplementaires,
      diagnostiques,
      traitements,
      pronostic,
      file, // This will now be an array of all file paths
    } = req.body;

    // Debug input
    console.log("Updating test with ID:", id);
    console.log("File data received:", file);

    // Validate test exists
    const existingTest = await Test.findById(id);
    if (!existingTest) {
      return res.status(404).json({
        success: false,
        error: "Test not found",
      });
    }

    // Validate horse exists
    const horse = await Horse.findById(horseId);
    if (!horse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Format examensComplementaires if provided
    const formattedExamens = (examensComplementaires || []).map((exam) => ({
      name: exam.name,
      checked: exam.checked ?? true,
      comment: exam.comment ?? "",
    }));

    // Ensure file is always an array or null
    const processedFiles = file ? (Array.isArray(file) ? file : [file]) : null;

    // Prepare update data
    const updateData = {
      horse: horseId,
      type,
      date,
      dateDeGuerison,
      dateRappel, // Added dateRappel field
      username, // Added username field
      anamnese,
      examenClinique,
      examensComplementaires: formattedExamens,
      diagnostiques,
      traitements,
      pronostic,
      file: processedFiles,
    };

    console.log("Update data file field:", updateData.file);

    // Update test
    const updatedTest = await Test.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("horse", "name matricule");

    console.log("Test updated successfully");
    console.log("Updated test files:", updatedTest.file);

    res.status(200).json({
      success: true,
      data: updatedTest,
    });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Test by ID
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { readdirSync, existsSync } = require("fs");
    const { join } = require("path");

    // Helper functions for directory naming
    function createSafeFolderName(str) {
      return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    }

    function createTestFolderName(testName, date) {
      const safeName = createSafeFolderName(testName);
      const formattedDate = new Date(date).toISOString().split("T")[0];
      return `${safeName}_${formattedDate}`;
    }

    // Validate that the ID is in the correct format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid test ID format",
      });
    }

    // Find test and populate horse information
    const test = await Test.findById(id)
      .populate({
        path: "horse",
        select: "name matricule race discipline horseId birthDate",
      })
      .populate({
        path: "createdBy",
        select: "name role",
      })
      .lean();

    // Check if test exists
    if (!test) {
      return res.status(404).json({
        success: false,
        error: "Test not found",
      });
    }

    // Format dates and ensure examensComplementaires is properly structured
    const formattedTest = {
      ...test,
      date: test.date ? new Date(test.date).toISOString() : null,
      dateDeGuerison: test.dateDeGuerison
        ? new Date(test.dateDeGuerison).toISOString()
        : null,
      dateRappel: test.dateRappel
        ? new Date(test.dateRappel).toISOString()
        : null,
      username: test.username || "",
      examensComplementaires: test.examensComplementaires.map((exam) => ({
        name: exam.name,
        checked: exam.checked ?? true,
        comment: exam.comment ?? "",
      })),
      createdAt: test.createdAt ? new Date(test.createdAt).toISOString() : null,
      updatedAt: test.updatedAt ? new Date(test.updatedAt).toISOString() : null,
    };

    // Get files from directory
    const horseId = test.horse?.horseId.toString() || test.horseId;

    if (horseId && test.type && test.date) {
      try {
        const testFolderName = createTestFolderName(test.type, test.date);
        console.log("Test directory:", testFolderName);
        console.log(horseId);
        const testDir = join(
          process.cwd(),
          "public",
          "uploads",
          "horses",
          horseId,
          "tests",
          testFolderName
        );
        console.log("Test directory:", testFolderName);
        console.log("Test directory:", testDir);
        if (existsSync(testDir)) {
          const files = readdirSync(testDir);
          formattedTest.initialFile = files.map(
            (file) =>
              `/uploads/horses/${horseId}/tests/${testFolderName}/${file}`
          );
        } else {
          formattedTest.initialFile = [];
        }
      } catch (err) {
        console.error("Error reading directory:", err);
        formattedTest.initialFile = [];
      }
    } else {
      formattedTest.initialFile = [];
    }

    // Return successful response with formatted test data
    res.status(200).json({
      success: true,
      data: formattedTest,
    });
  } catch (error) {
    console.error("Error fetching test by ID:", error);

    // Handle different types of errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid test ID format",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: "Error retrieving test details",
      message: error.message,
    });
  }
};
