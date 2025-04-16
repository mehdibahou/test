const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateDeGuerison: {
      type: Date,
      required: false,
      validate: {
        validator: function (value) {
          // Skip validation if no value provided
          if (!value) return true;
          // Ensure dateDeGuerison is after the initial date
          return this.date && value >= this.date;
        },
        message:
          "La date de guérison doit être postérieure à la date de création du test",
      },
    },
    // New field: dateRappel (reminder date)
    dateRappel: {
      type: Date,
      required: false,
      validate: {
        validator: function (value) {
          // Skip validation if no value provided
          if (!value) return true;
          // Ensure dateRappel is after the initial date
          return this.date && value >= this.date;
        },
        message:
          "La date de rappel doit être postérieure à la date de création du test",
      },
    },
    // New field: username
    username: {
      type: String,
      required: false,
      default: "",
    },
    anamnese: {
      type: String,
      required: true,
    },
    examenClinique: {
      type: String,
      required: true,
    },
    examensComplementaires: [
      {
        name: {
          type: String,
          required: true,
        },
        checked: {
          type: Boolean,
          default: true,
        },
        comment: {
          type: String,
          default: "",
        },
      },
    ],
    diagnostiques: {
      type: String,
      required: true,
    },
    traitements: {
      type: String,
      required: true,
    },
    pronostic: {
      type: String,
      required: true,
    },
    isRadie: {
      type: Boolean,
      default: false,
    },
    file: [
      {
        type: String,
        required: false,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Test = mongoose.models.Test || mongoose.model("Test", testSchema);

module.exports = { Test };
