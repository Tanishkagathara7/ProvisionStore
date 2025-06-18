const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot be more than 100 characters"],
    },
    pricePerUnit: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0, "Price cannot be negative"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0, "Weight cannot be negative"],
    },
    weightUnit: {
      type: String,
      required: true,
      enum: ["kg", "gm"],
      default: "kg",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Grains",
        "Pulses",
        "Spices",
        "Oil & Ghee",
        "Beverages",
        "Sweeteners",
        "Dairy",
        "Snacks",
        "Others",
      ],
      default: "Others",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
productSchema.index({ userId: 1, isActive: 1 });
productSchema.index({ name: 1, category: 1 });

// Virtual for total value calculation
productSchema.virtual("totalValue").get(function () {
  if (this.weightUnit === "gm") {
    return (this.pricePerUnit * this.weight) / 1000;
  }
  return this.pricePerUnit * this.weight;
});

// Ensure virtual fields are serialized
productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
