import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    horse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
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
        name: String,
        checked: Boolean,
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
    images: [
      {
        name: String,
        url: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Test = mongoose.models.Test || mongoose.model('Test', testSchema);
