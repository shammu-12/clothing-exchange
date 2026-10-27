const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  targetType: { type: String, enum: ["Listing", "Swap", "CommunityPost"], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, enum: ["Inappropriate content", "Misleading listing", "Safety concern", "Swap dispute", "Other"], required: true },
  details: { type: String, trim: true, maxlength: 1500, default: "" },
  status: { type: String, enum: ["Open", "Resolved", "Dismissed"], default: "Open", index: true },
  resolution: { type: String, trim: true, maxlength: 1500, default: "" },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

reportSchema.index({ targetType: 1, targetId: 1, status: 1 });

module.exports = mongoose.model("Report", reportSchema);
