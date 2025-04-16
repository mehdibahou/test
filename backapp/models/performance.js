const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema(
  {
    horse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Horse",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    competitionType: {
      type: String,
      enum: ["CSO", "Endurance", "Course", "Autre"],
      required: true,
    },
    competitionName: {
      type: String,
      required: function () {
        return this.competitionType === "Autre";
      },
    },
    epreuve: {
      type: String,
      enum: [
        "CSO1*",
        "CSO2*",
        "CSO3*",
        "CSO4*",
        "CJC4ans",
        "CJC5ans",
        "championat du maroc",
        "coupe du trone",
        "autre",
        null,
      ],
      required: function () {
        return this.competitionType === "CSO";
      },
    },
    epreuveCustom: {
      type: String,
      required: function () {
        return this.competitionType === "CSO" && this.epreuve === "autre";
      },
    },
    lieu: {
      type: String,
      required: true,
    },
    isRadie: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
    },
    result: {
      type: String,
    },
    rider: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Performance =
  mongoose.models.Performance ||
  mongoose.model("Performance", performanceSchema);

module.exports = { Performance };
