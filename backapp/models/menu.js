import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true, // Ensures one menu per restaurant
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FoodProduct",
        required: true,
      },
      isAvailable: {
        type: Boolean,
        default: true,
      }
    }],
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
menuSchema.index({ restaurant: 1 });
menuSchema.index({ 'items.product': 1 });

// Helper method to add item to menu
menuSchema.methods.addItem = function(productId) {
  if (!this.items.some(item => item.product.equals(productId))) {
    this.items.push({ product: productId });
  }
};

// Helper method to remove item from menu
menuSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => !item.product.equals(productId));
};

const Menu = mongoose.models.Menu || mongoose.model("Menu", menuSchema);

export default Menu;