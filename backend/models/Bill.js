const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  weightUnit: {
    type: String,
    required: true,
    enum: ["kg", "gm"],
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  itemTotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
      maxlength: [100, "Customer name cannot be more than 100 characters"],
    },
    items: [billItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "completed", "cancelled"],
      default: "completed",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      default: "cash",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Index for better query performance
billSchema.index({ userId: 1, createdAt: -1 });
billSchema.index({ billNumber: 1 });
billSchema.index({ status: 1 });

// Pre-save middleware to generate bill number
billSchema.pre("save", async function (next) {
  if (this.isNew && !this.billNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

    // Find the last bill created today
    const lastBill = await this.constructor
      .findOne({
        billNumber: { $regex: `^BILL${dateStr}` },
      })
      .sort({ billNumber: -1 });

    let sequence = 1;
    if (lastBill) {
      const lastSequence = parseInt(lastBill.billNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    this.billNumber = `BILL${dateStr}${sequence.toString().padStart(4, "0")}`;
  }
  next();
});

// Virtual for formatted bill number
billSchema.virtual("formattedBillNumber").get(function () {
  return this.billNumber.replace(/^BILL/, "BILL-");
});

// Ensure virtual fields are serialized
billSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Bill", billSchema);
