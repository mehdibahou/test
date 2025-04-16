const { Prophylaxie } = require("../models/prophylaxie");
const { Horse } = require("../models/horse");
const fs = require("fs/promises");
const path = require("path");

// Create Prophylaxie
exports.createProphylaxie = async (req, res) => {
  try {
    const { horseId, type, date, dateRappel, details, notes, file, createdBy } =
      req.body;

    // Validate horse exists
    const horse = await Horse.findById(horseId);
    if (!horse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Process details to handle maladies array
    const processedDetails = { ...details };

    // Special handling for vaccination and Autres option
    if (type === "Vaccination") {
      if (
        processedDetails.maladies &&
        Array.isArray(processedDetails.maladies)
      ) {
        // Keep the maladies array
        if (
          processedDetails.maladies.includes("Autres") &&
          processedDetails.maladieAutre
        ) {
          // Keep both maladies array and maladieAutre for reference
          processedDetails.maladieAutre = processedDetails.maladieAutre;
        }
        // For backward compatibility
        if (processedDetails.maladies.length > 0) {
          // i need to concat the array elements
          processedDetails.maladie = processedDetails.maladies.join(", ");
        }
      } else if (processedDetails.maladie && !processedDetails.maladies) {
        // Convert single maladie to array for older requests
        processedDetails.maladies = [processedDetails.maladie];
      }
    }

    // Create new prophylaxie record
    const newProphylaxie = new Prophylaxie({
      horse: horseId,
      type,
      date,
      dateRappel,
      details: processedDetails,
      notes,
      file,
      createdBy,
    });

    await newProphylaxie.save();

    res.status(201).json({
      success: true,
      data: newProphylaxie,
    });
  } catch (error) {
    console.error("Error creating prophylaxie:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Prophylaxie records with filters
exports.getProphylaxies = async (req, res) => {
  try {
    const {
      horseId,
      startDate,
      endDate,
      type,
      maladies, // New filter for array of maladies
      // Horse-specific filters
      etat,
      race,
      robe,
      discipline,
      ageRange,
    } = req.query;

    // Build the prophylaxie query
    const query = {};

    // Add horse filter
    if (horseId) {
      query.horse = horseId;
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

    // Add type filter
    if (type) {
      query.type = type;
    }

    // Add maladies filter - works with both string and array format
    if (maladies) {
      const maladiesList = Array.isArray(maladies) ? maladies : [maladies];
      query.$or = [
        { "details.maladies": { $in: maladiesList } }, // New format
        { "details.maladie": { $in: maladiesList } }, // Old format
      ];
    }

    // Execute the query
    const prophylaxies = await Prophylaxie.find(query)
      .populate("horse", "name matricule race discipline")
      .sort({ date: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: prophylaxies,
      count: prophylaxies.length,
    });
  } catch (error) {
    console.error("Error fetching prophylaxies:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Latest Prophylaxie records
exports.getLatestProphylaxies = async (req, res) => {
  try {
    const totalCount = await Prophylaxie.countDocuments();

    // Extract filters
    const { type } = req.query;

    // Build the aggregation pipeline
    const pipeline = [];

    // First filter by type if provided
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

    // Unwind the horseDetails array
    pipeline.push({ $unwind: "$horseDetails" });

    // Project the final fields we want
    pipeline.push({
      $project: {
        _id: 1,
        date: 1,
        dateRappel: 1,
        type: 1,
        details: 1,
        notes: 1,
        createdBy: 1,
        file: 1,
        updatedAt: 1,
        horse: {
          _id: "$horseDetails._id",
          name: "$horseDetails.name",
          matricule: "$horseDetails.matricule",
          race: "$horseDetails.race",
          discipline: "$horseDetails.discipline",
        },
      },
    });

    const prophylaxies = await Prophylaxie.aggregate(pipeline);

    res.json({
      data: prophylaxies,
      success: true,
      count: prophylaxies.length,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching latest prophylaxies:", error);
    res.status(500).json({
      error: "Failed to fetch latest prophylaxie records",
    });
  }
};

// Delete Prophylaxie
exports.deleteProphylaxie = async (req, res) => {
  try {
    const { id } = req.params;

    const prophylaxie = await Prophylaxie.findById(id);

    if (!prophylaxie) {
      return res.status(404).json({
        success: false,
        error: "Prophylaxie record not found",
      });
    }

    // Handle file deletion if files exist
    if (prophylaxie.file && prophylaxie.file.length > 0) {
      try {
        const filePath = prophylaxie.file[0];
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
          console.log(
            `Successfully removed prophylaxie folder: ${fullFolderPath}`
          );
        }
      } catch (dirError) {
        console.error(`Error removing prophylaxie folder:`, dirError);
      }
    }

    await Prophylaxie.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Prophylaxie record and associated folder deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting prophylaxie:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Prophylaxie Types
exports.getProphylaxieTypes = async (req, res) => {
  try {
    const types = ["Vaccination", "Vermifugation", "Soins dentaires", "Autre"];

    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error("Error fetching prophylaxie types:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update Prophylaxie
exports.updateProphylaxie = async (req, res) => {
  try {
    const { id } = req.params;
    const { horseId, type, date, dateRappel, details, notes, file } = req.body;

    // Validate prophylaxie exists
    const existingProphylaxie = await Prophylaxie.findById(id);
    if (!existingProphylaxie) {
      return res.status(404).json({
        success: false,
        error: "Prophylaxie record not found",
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

    // Process details to handle maladies array
    const processedDetails = { ...details };

    // Special handling for vaccination and Autres option
    if (type === "Vaccination") {
      if (
        processedDetails.maladies &&
        Array.isArray(processedDetails.maladies)
      ) {
        // Keep the maladies array
        if (
          processedDetails.maladies.includes("Autres") &&
          processedDetails.maladieAutre
        ) {
          // Keep both maladies array and maladieAutre for reference
          processedDetails.maladieAutre = processedDetails.maladieAutre;
        }
        // For backward compatibility
        if (processedDetails.maladies.length > 0) {
          processedDetails.maladie = processedDetails.maladies.join(", ");
        }
      } else if (processedDetails.maladie && !processedDetails.maladies) {
        // Convert single maladie to array for older requests
        processedDetails.maladies = [processedDetails.maladie];
      }
    }

    // Ensure file is always an array or null
    const processedFiles = file ? (Array.isArray(file) ? file : [file]) : null;

    // Prepare update data
    const updateData = {
      horse: horseId,
      type,
      date,
      dateRappel,
      details: processedDetails,
      notes,
      file: processedFiles,
    };

    // Update prophylaxie
    const updatedProphylaxie = await Prophylaxie.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate("horse", "name matricule");

    res.status(200).json({
      success: true,
      data: updatedProphylaxie,
    });
  } catch (error) {
    console.error("Error updating prophylaxie:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Prophylaxie by ID
exports.getProphylaxieById = async (req, res) => {
  try {
    const { id } = req.params;
    const { readdirSync, existsSync } = require("fs");
    const { join } = require("path");

    // Helper functions for directory naming
    function createSafeFolderName(str) {
      return str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    }

    function createProphylaxieFolderName(type, date) {
      const safeName = createSafeFolderName(type);
      const formattedDate = new Date(date).toISOString().split("T")[0];
      return `${safeName}_${formattedDate}`;
    }

    // Validate that the ID is in the correct format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid prophylaxie ID format",
      });
    }

    // Find prophylaxie and populate horse information
    const prophylaxie = await Prophylaxie.findById(id)
      .populate({
        path: "horse",
        select: "name matricule race discipline horseId birthDate",
      })
      .populate({
        path: "createdBy",
        select: "name role",
      })
      .lean();

    // Check if prophylaxie exists
    if (!prophylaxie) {
      return res.status(404).json({
        success: false,
        error: "Prophylaxie record not found",
      });
    }

    // Format dates
    const formattedProphylaxie = {
      ...prophylaxie,
      date: prophylaxie.date ? new Date(prophylaxie.date).toISOString() : null,
      dateRappel: prophylaxie.dateRappel
        ? new Date(prophylaxie.dateRappel).toISOString()
        : null,
      createdAt: prophylaxie.createdAt
        ? new Date(prophylaxie.createdAt).toISOString()
        : null,
      updatedAt: prophylaxie.updatedAt
        ? new Date(prophylaxie.updatedAt).toISOString()
        : null,
    };

    // Get files from directory
    const horseId =
      prophylaxie.horse?.horseId?.toString() || prophylaxie.horseId;
    console.log("Horse ID:", horseId);

    if (horseId && prophylaxie.type && prophylaxie.date) {
      try {
        const prophylaxieFolderName = createProphylaxieFolderName(
          prophylaxie.type,
          prophylaxie.date
        );
        const prophylaxieDir = join(
          process.cwd(),
          "public",
          "uploads",
          "horses",
          horseId,
          "prophylaxie",
          prophylaxieFolderName
        );

        if (existsSync(prophylaxieDir)) {
          const files = readdirSync(prophylaxieDir);
          formattedProphylaxie.initialFile = files.map(
            (file) =>
              `/uploads/horses/${horseId}/prophylaxie/${prophylaxieFolderName}/${file}`
          );
        } else {
          formattedProphylaxie.initialFile = [];
        }
      } catch (err) {
        console.error("Error reading directory:", err);
        formattedProphylaxie.initialFile = [];
      }
    } else {
      formattedProphylaxie.initialFile = [];
    }

    // Return successful response with formatted prophylaxie data
    res.status(200).json({
      success: true,
      data: formattedProphylaxie,
    });
  } catch (error) {
    console.error("Error fetching prophylaxie by ID:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid prophylaxie ID format",
      });
    }

    res.status(500).json({
      success: false,
      error: "Error retrieving prophylaxie details",
      message: error.message,
    });
  }
};
