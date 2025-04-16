const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

const horseSchema = new mongoose.Schema(
  {
    horseId: {
      type: Number,
      unique: true,
    },
    matricule: {
      type: String,
      required: false,
      unique: false,
    },
    Provenance: {
      type: String,
      required: false,
    },
    Taille: {
      type: String,
      required: false,
    },
    Puce: {
      type: String,
      required: false,
    },
    Detachement: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    race: {
      type: String,
      required: true,
    },
    otherRace: {
      type: String,
    },
    birthDate: {
      type: Date,
      required: true,
    },
    sex: {
      type: String,
      enum: ["Male", "Femelle", "Hongre"],
      required: true,
    },
    robe: {
      type: String,
      required: true,
    },
    otherRobe: {
      type: String,
    },
    discipline: {
      type: String,
      required: true,
    },
    otherDiscipline: {
      type: String,
    },
    etat: {
      type: String,
      enum: ["malade", "sain", "en rétablissement"],
      required: true,
      default: "sain",
    },
    father: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Horse",
      default: null,
    },
    fatherText: {
      type: String,
      default: null,
    },
    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Horse",
      default: null,
    },
    motherText: {
      type: String,
      default: null,
    },
    isRadie: {
      type: Boolean,
      default: false,
    },
    motifderadiation: {
      type: String,
      enum: ["Mort", "Euthanasie", "Cession", "Vente", "Autre"],
      default: null,
    },
    dateRadiation: {
      type: Date,
      default: null,
    },
    cause: {
      type: String,
      default: null,
    },
    motif: {
      type: String,
      default: null,
    },
    reference: {
      type: String,
      default: null,
    },
    isMutated: {
      type: Boolean,
      default: false,
    },
    dateMutation: {
      type: Date,
      default: null,
    },
    nouvelleAffectation: {
      type: String,
      default: null,
    },
    mutationReference: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to handle parent text entries
horseSchema.pre("save", async function (next) {
  // If fatherText is provided but no father ID, clear father field

  if (!this.horseId) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "horseId" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    this.horseId = counter.sequence_value;
  }

  if (this.fatherText && !this.father) {
    this.father = null;
  }

  // If motherText is provided but no mother ID, clear mother field
  if (this.motherText && !this.mother) {
    this.mother = null;
  }

  next();
});

const Horse = mongoose.models.Horse || mongoose.model("Horse", horseSchema);

module.exports = { Horse };
