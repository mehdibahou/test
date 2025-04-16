// models/supplier.js
import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    description: {
      type: String,
      required: false,
    },
    contactInfo: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Supplier =
  mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
export default Supplier;
