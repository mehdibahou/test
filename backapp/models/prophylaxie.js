const mongoose = require("mongoose");

const prophylaxieSchema = new mongoose.Schema(
  {
    horse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Horse",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    types: {
      type: [String],
      default: [],
    },
    date: {
      type: Date,
      required: true,
    },
    dateRappel: {
      type: Date,
      required: true,
    },
    details: {
      // For Vaccination
      nomVaccin: String,
      maladies: [String], // Changed from single maladie to array of maladies
      maladieAutre: String,
      maladie: String, // Keep for backward compatibility

      // For Vermifugation
      nomProduit: String,

      // For Soins dentaires
      typeIntervention: String,

      // For Autre
      typeAutre: String,
      descriptionAutre: String,

      // For multiple types
      multipleTypesDetails: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: () => new Map(),
      },
    },
    notes: String,
    file: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isRadie: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Prophylaxie = mongoose.model("Prophylaxie", prophylaxieSchema);

module.exports = { Prophylaxie };
