import mongoose from "mongoose";

const foodProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    variants: {
      type: [Object], // Array of objects for variants
      default: [], // Ensure it's an empty array by default
    },
    price: {
      type: Number,
      required: true,
    },
    glovoprice: {
      type: Number,
      required: true,
    },
    off: {
      type: Number,
      default: 0, // Discount or offer percentage
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true, // Make category required
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add indexes for better query performance
foodProductSchema.index({ category: 1 });
foodProductSchema.index({ store: 1 });
foodProductSchema.index({ name: 1 });

// Check if the model is already compiled before defining it
const FoodProduct =
  mongoose.models.FoodProduct ||
  mongoose.model("FoodProduct", foodProductSchema);

export default FoodProduct;
