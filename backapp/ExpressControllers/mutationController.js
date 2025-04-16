// controllers/mutationController.js
const { Horse } = require("../models/horse");
const { Test } = require("../models/test");
const { Performance } = require("../models/performance");
const { Prophylaxie } = require("../models/prophylaxie");
const mongoose = require("mongoose");

/**
 * Mark a horse as mutated (transferred)
 */
exports.mutateHorse = async (req, res) => {
  try {
    const { id } = req.params;
    const { dateMutation, nouvelleAffectation, mutationReference } = req.body;

    console.log("Request to mutate horse:", req.body);

    // Validate required fields
    if (!dateMutation || !nouvelleAffectation || !mutationReference) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: dateMutation, nouvelleAffectation, and mutationReference are required",
      });
    }

    // Update the horse
    const updatedHorse = await Horse.findByIdAndUpdate(
      id,
      {
        isMutated: true,
        dateMutation: new Date(dateMutation),
        nouvelleAffectation,
        mutationReference,
      },
      { new: true, runValidators: true }
    );

    if (!updatedHorse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Update all associated tests
    await Test.updateMany({ horse: id }, { isMutated: true });

    // Update all associated performances
    await Performance.updateMany({ horse: id }, { isMutated: true });

    // Update all associated prophylaxies
    await Prophylaxie.updateMany({ horse: id }, { isMutated: true });

    res.status(200).json({
      success: true,
      data: updatedHorse,
      message:
        "Horse and associated records have been successfully marked as mutated",
    });
  } catch (error) {
    console.error("Error mutating horse:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred while updating the horse",
    });
  }
};

/**
 * Get all mutated horses
 */
exports.getMutatedHorses = async (req, res) => {
  try {
    const horses = await Horse.find({ isMutated: true })
      .select(
        "name matricule race discipline robe horseId dateMutation nouvelleAffectation mutationReference"
      )
      .sort({ dateMutation: -1 });

    res.status(200).json({
      success: true,
      count: horses.length,
      data: horses,
    });
  } catch (error) {
    console.error("Error fetching mutated horses:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get mutation details for a specific horse
 */
exports.getMutationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const horse = await Horse.findById(id).select(
      "name matricule race discipline isMutated dateMutation nouvelleAffectation mutationReference"
    );

    if (!horse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    if (!horse.isMutated) {
      return res.status(200).json({
        success: true,
        data: {
          ...horse.toObject(),
          mutationMessage: "This horse is not mutated",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: horse,
    });
  } catch (error) {
    console.error("Error fetching mutation details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Cancel a horse mutation (undo mutation)
 */
exports.cancelMutation = async (req, res) => {
  try {
    const { id } = req.params;

    // Update the horse
    const updatedHorse = await Horse.findByIdAndUpdate(
      id,
      {
        isMutated: false,
        dateMutation: null,
        nouvelleAffectation: null,
        mutationReference: null,
      },
      { new: true }
    );

    if (!updatedHorse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Update all associated tests
    await Test.updateMany({ horse: id }, { isMutated: false });

    // Update all associated performances
    await Performance.updateMany({ horse: id }, { isMutated: false });

    // Update all associated prophylaxies
    await Prophylaxie.updateMany({ horse: id }, { isMutated: false });

    res.status(200).json({
      success: true,
      data: updatedHorse,
      message: "Mutation has been successfully canceled",
    });
  } catch (error) {
    console.error("Error canceling mutation:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
