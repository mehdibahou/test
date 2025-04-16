// models/marketorder.js
import mongoose from "mongoose";

const marketOrderSchema = new mongoose.Schema({
  // Order Items
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MarketProduct",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],

  // Product names for display (in case product details change)
  productNames: [String],

  // Order total
  total: {
    type: Number,
    required: true,
  },

  // State: bon de commande or facture
  state: {
    type: String,
    enum: ["bon de commande", "facture"],
    default: "bon de commande",
  },

  // Status tracking
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },

  // Notes
  notes: {
    type: String,
    default: "",
  },

  // Relations
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MarketOrder =
  mongoose.models.MarketOrder ||
  mongoose.model("MarketOrder", marketOrderSchema);
export default MarketOrder;
