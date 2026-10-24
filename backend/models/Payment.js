const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  swap: { type: mongoose.Schema.Types.ObjectId, ref: "SwapRequest", required: true, index: true },
  payer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amountPaise: { type: Number, required: true, min: 100 },
  currency: { type: String, enum: ["INR"], default: "INR" },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String, default: "" },
  status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
}, { timestamps: true });

paymentSchema.index({ swap: 1, payer: 1 }, { unique: true });

module.exports = mongoose.model("Payment", paymentSchema);
