import mongoose from 'mongoose';

const horseSchema = new mongoose.Schema(
  {
    matricule: {
      type: String,
      required: true,
      unique: true,
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
      enum: ['Male', 'Femelle', 'Hongre'],
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
      enum: ['malade', 'sain', 'en rétablissement'],
      required: true,
      default: 'sain'  // Setting a default value of 'sain'
    },
    father: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      default: null // Allow null if no father is provided
    },
    mother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      default: null
    },
  },
  { timestamps: true }
);

export const Horse = mongoose.models.Horse || mongoose.model('Horse', horseSchema);