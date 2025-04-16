// controllers/radiationController.js
const { Horse } = require("../models/horse");
const { Test } = require("../models/test");
const { Performance } = require("../models/performance");
const { Prophylaxie } = require("../models/prophylaxie");
const mongoose = require("mongoose");

/**
 * Mark a horse as radiated (logically deleted)
 */
exports.radiateHorse = async (req, res) => {
  try {
    const { id } = req.params;
    const { motifderadiation, dateRadiation, cause, motif, reference } =
      req.body;

    console.log("Request to radiate horse:", req.body);

    // Validate required fields
    if (!dateRadiation) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: motifderadiation and dateRadiation are required",
      });
    }

    // Validate motifderadiation value
    const validMotifs = ["Mort", "Euthanasie", "Cession", "Vente", "Autre"];
    if (!validMotifs.includes(motifderadiation)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid motifderadiation value. Must be one of: Mort, Euthanasie, Cession, Vente, Autre",
      });
    }

    // Validate that appropriate fields are provided based on motifderadiation
    // if (["Mort", "Euthanasie"].includes(motifderadiation) && !cause) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Cause is required for Mort and Euthanasie",
    //   });
    // }

    // if (["Cession", "Vente", "Autre"].includes(motifderadiation) && !motif) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Motif is required for Cession, Vente, and Autre",
    //   });
    // }

    // Check if reference is provided
    if (!reference) {
      return res.status(400).json({
        success: false,
        error: "Reference is required for all radiation types",
      });
    }

    // Update the horse without using transactions
    const updatedHorse = await Horse.findByIdAndUpdate(
      id,
      {
        isRadie: true,
        motifderadiation,
        dateRadiation: new Date(dateRadiation),
        cause: ["Mort", "Euthanasie"].includes(motifderadiation) ? cause : null,
        motif: ["Cession", "Vente", "Autre"].includes(motifderadiation)
          ? motif
          : null,
        reference,
      },
      { new: true, runValidators: true }
    );

    if (!updatedHorse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Update all associated tests - without transaction
    await Test.updateMany({ horse: id }, { isRadie: true });

    // Update all associated performances - without transaction
    await Performance.updateMany({ horse: id }, { isRadie: true });

    // Update all associated prophylaxies - without transaction
    await Prophylaxie.updateMany({ horse: id }, { isRadie: true });

    res.status(200).json({
      success: true,
      data: updatedHorse,
      message:
        "Horse and associated records have been successfully marked as radiated",
    });
  } catch (error) {
    console.error("Error radiating horse:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while updating the horse",
    });
  }
};

/**
 * Get all radiated horses
 */
exports.getRadiatedHorses = async (req, res) => {
  try {
    const horses = await Horse.find({ isRadie: true })
      .select(
        "name matricule race discipline robe horseId motifderadiation dateRadiation cause motif reference"
      )
      .sort({ dateRadiation: -1 });

    res.status(200).json({
      success: true,
      count: horses.length,
      data: horses,
    });
  } catch (error) {
    console.error("Error fetching radiated horses:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get radiation details for a specific horse
 */
exports.getRadiationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const horse = await Horse.findById(id).select(
      "name matricule race discipline isRadie motifderadiation dateRadiation cause motif reference"
    );

    if (!horse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    if (!horse.isRadie) {
      return res.status(200).json({
        success: true,
        data: {
          ...horse.toObject(),
          radiationMessage: "This horse is not radiated",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: horse,
    });
  } catch (error) {
    console.error("Error fetching radiation details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Cancel a horse radiation (undo radiation)
 */
exports.cancelRadiation = async (req, res) => {
  try {
    const { id } = req.params;

    // Update the horse without using transactions
    const updatedHorse = await Horse.findByIdAndUpdate(
      id,
      {
        isRadie: false,
        motifderadiation: null,
        dateRadiation: null,
        cause: null,
        motif: null,
        reference: null,
      },
      { new: true }
    );

    if (!updatedHorse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Update all associated tests - without transaction
    await Test.updateMany({ horse: id }, { isRadie: false });

    // Update all associated performances - without transaction
    await Performance.updateMany({ horse: id }, { isRadie: false });

    // Update all associated prophylaxies - without transaction
    await Prophylaxie.updateMany({ horse: id }, { isRadie: false });

    res.status(200).json({
      success: true,
      data: updatedHorse,
      message: "Radiation has been successfully canceled",
    });
  } catch (error) {
    console.error("Error canceling radiation:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
