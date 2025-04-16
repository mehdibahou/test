import mongoose from "mongoose";

const marketcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxLength: [50, "Category name cannot exceed 50 characters"],
      unique: true,
    },
    image: {
      type: String,
      required: [true, "Category image URL is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: [200, "Description cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Marketcategory ||
  mongoose.model("Marketcategory", marketcategorySchema);
