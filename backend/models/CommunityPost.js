const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, enum: ["Swap story", "Care & repair", "Slow fashion"], required: true },
  body: { type: String, required: true, trim: true, maxlength: 1000 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

communityPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CommunityPost", communityPostSchema);
