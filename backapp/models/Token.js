import { Schema, model, models } from 'mongoose';
import mongoose from 'mongoose';
const TokenSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionToken: {
      type: String,
      required: true, // Consider making this required
    },
    expiryDate: {
      type: Date,
      expires: '7d', // Automatically remove documents 7 days after `expiryDate`
    },
  },
  {
    timestamps: true,
  }
);

// Create or retrieve the model
// const Token = models.Token || model('Token', TokenSchema);
const Token= mongoose.models.Token || mongoose.model('Token', TokenSchema);

export default Token;
