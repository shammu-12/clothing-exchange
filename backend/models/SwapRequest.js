const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  carrier: { type: String, required: true, trim: true, maxlength: 80 },
  trackingNumber: { type: String, trim: true, maxlength: 120, default: "" },
  trackingUrl: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["Preparing", "Label created", "In transit", "Delivered"], default: "Preparing" },
}, { timestamps: true });

const swapRequestSchema = new mongoose.Schema(
  {
    clothing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothing",
      required: true,
    },

    offeredClothing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothing",
      default: null,
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Completed",
      ],
      default: "Pending",
    },

    deliveryMode: { type: String, enum: ["Local", "Remote"], default: "Local" },
    shipments: { type: [shipmentSchema], default: [] },
    completionConfirmations: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SwapRequest",
  swapRequestSchema
);
