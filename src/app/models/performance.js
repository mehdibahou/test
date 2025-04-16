import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema(
  {
    horse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Horse',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    competition: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
    rider: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Performance = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);
