const mongoose = require("mongoose");
const Clothing = require("../models/Clothing");
const CommunityPost = require("../models/CommunityPost");
const Report = require("../models/Report");
const SwapRequest = require("../models/SwapRequest");

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details = "" } = req.body;
    if (!["Listing", "Swap", "CommunityPost"].includes(targetType) || !mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ message: "Choose a valid listing, swap, or community post to report" });
    }
    const reasons = ["Inappropriate content", "Misleading listing", "Safety concern", "Swap dispute", "Other"];
    if (!reasons.includes(reason) || typeof details !== "string" || details.length > 1500) {
      return res.status(400).json({ message: "Provide a reason and keep details under 1,500 characters" });
    }

    let target;
    if (targetType === "Listing") target = await Clothing.findById(targetId).select("owner");
    if (targetType === "Swap") target = await SwapRequest.findById(targetId).select("requester owner");
    if (targetType === "CommunityPost") target = await CommunityPost.findById(targetId).select("author");
    if (!target) return res.status(404).json({ message: "The item you selected could not be found" });

    if (targetType === "Listing" && target.owner.toString() === req.user.id) return res.status(400).json({ message: "You cannot report your own listing" });
    if (targetType === "CommunityPost" && target.author.toString() === req.user.id) return res.status(400).json({ message: "You cannot report your own post" });
    if (targetType === "Swap" && ![target.requester.toString(), target.owner.toString()].includes(req.user.id)) {
      return res.status(403).json({ message: "Only swap participants can raise a dispute" });
    }

    const existing = await Report.findOne({ reporter: req.user.id, targetType, targetId, status: "Open" });
    if (existing) return res.status(409).json({ message: "You already have an open report for this item" });
    const report = await Report.create({ reporter: req.user.id, targetType, targetId, reason, details: details.trim() });
    res.status(201).json({ message: "Report sent to the moderation team", reportId: report._id });
  } catch (error) {
    console.error("Create report error:", error.message);
    res.status(500).json({ message: "Unable to send the report" });
  }
};

module.exports = { createReport };
