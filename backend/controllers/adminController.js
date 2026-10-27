const Clothing = require("../models/Clothing");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");
const Report = require("../models/Report");
const CommunityPost = require("../models/CommunityPost");

const getOverview = async (req, res) => {
  try {
    const [users, listings, swaps, pending] = await Promise.all([
      User.countDocuments(),
      Clothing.countDocuments({ status: "Available" }),
      SwapRequest.countDocuments({ status: "Completed" }),
      SwapRequest.countDocuments({ status: "Pending" }),
    ]);
    const totalRequests = await SwapRequest.countDocuments();
    const conversionRate = totalRequests ? Number(((swaps / totalRequests) * 100).toFixed(1)) : 0;
    res.json({ users, listings, successfulSwaps: swaps, pendingSwaps: pending, totalRequests, conversionRate });
  } catch (error) {
    res.status(500).json({ message: "Unable to load admin overview" });
  }
};

const getListings = async (req, res) => {
  try {
    const listings = await Clothing.find().populate("owner", "name email location").sort({ createdAt: -1 });
    res.json({ listings });
  } catch (error) {
    res.status(500).json({ message: "Unable to load listings" });
  }
};

const moderateListing = async (req, res) => {
  try {
    const status = req.body.status;
    if (!['Available', 'Reserved', 'Swapped', 'Removed'].includes(status)) {
      return res.status(400).json({ message: "Invalid listing status" });
    }
    const listing = await Clothing.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json({ listing });
  } catch (error) {
    res.status(500).json({ message: "Unable to moderate listing" });
  }
};

const getMembers = async (req, res) => {
  try {
    const members = await User.find().select("name email location role accountStatus createdAt").sort({ createdAt: -1 }).limit(500);
    res.json({ members });
  } catch (error) {
    res.status(500).json({ message: "Unable to load members" });
  }
};

const updateMemberStatus = async (req, res) => {
  try {
    if (!['Active', 'Suspended'].includes(req.body.status)) return res.status(400).json({ message: "Status must be Active or Suspended" });
    if (req.params.id === req.user.id) return res.status(400).json({ message: "You cannot suspend your own administrator account" });
    const member = await User.findByIdAndUpdate(req.params.id, { accountStatus: req.body.status }, { new: true, runValidators: true }).select("name email location role accountStatus createdAt");
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json({ member });
  } catch (error) {
    res.status(500).json({ message: "Unable to update member status" });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("reporter", "name email").populate("resolvedBy", "name").sort({ status: 1, createdAt: -1 }).limit(500).lean();
    const reportTargets = await Promise.all(reports.map(async (report) => {
      let target;
      if (report.targetType === "Listing") target = await Clothing.findById(report.targetId).select("title status").lean();
      if (report.targetType === "Swap") target = await SwapRequest.findById(report.targetId).select("status clothing offeredClothing").populate("clothing", "title").populate("offeredClothing", "title").lean();
      if (report.targetType === "CommunityPost") target = await CommunityPost.findById(report.targetId).select("topic body").lean();
      return { ...report, target };
    }));
    res.json({ reports: reportTargets });
  } catch (error) {
    res.status(500).json({ message: "Unable to load reports" });
  }
};

const resolveReport = async (req, res) => {
  try {
    const { status, resolution = "" } = req.body;
    if (!["Resolved", "Dismissed"].includes(status) || typeof resolution !== "string" || resolution.length > 1500) {
      return res.status(400).json({ message: "Choose Resolved or Dismissed and keep the note under 1,500 characters" });
    }
    const report = await Report.findByIdAndUpdate(req.params.id, { status, resolution: resolution.trim(), resolvedBy: req.user.id }, { new: true, runValidators: true }).populate("reporter", "name email").populate("resolvedBy", "name");
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: "Unable to update report" });
  }
};

const getSwapActivity = async (req, res) => {
  try {
    const swaps = await SwapRequest.find().populate("clothing", "title").populate("offeredClothing", "title").populate("requester", "name").populate("owner", "name").sort({ updatedAt: -1 }).limit(100);
    res.json({ swaps });
  } catch (error) {
    res.status(500).json({ message: "Unable to load swap activity" });
  }
};

const exportAnalytics = async (req, res) => {
  try {
    const [members, activeMembers, listings, availableListings, pendingRequests, completedSwaps, totalRequests, openReports] = await Promise.all([
      User.countDocuments(), User.countDocuments({ $or: [{ accountStatus: "Active" }, { accountStatus: { $exists: false } }] }), Clothing.countDocuments(), Clothing.countDocuments({ status: "Available" }), SwapRequest.countDocuments({ status: "Pending" }), SwapRequest.countDocuments({ status: "Completed" }), SwapRequest.countDocuments(), Report.countDocuments({ status: "Open" }),
    ]);
    const conversion = totalRequests ? ((completedSwaps / totalRequests) * 100).toFixed(1) : "0.0";
    const rows = [["Metric", "Value"], ["Total members", members], ["Active members", activeMembers], ["Total listings", listings], ["Available listings", availableListings], ["Pending swap requests", pendingRequests], ["Completed swaps", completedSwaps], ["Total swap requests", totalRequests], ["Completed request rate (%)", conversion], ["Open reports", openReports]];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=rewear-marketplace-report.csv");
    res.send(`\uFEFF${csv}\r\n`);
  } catch (error) {
    res.status(500).json({ message: "Unable to export marketplace analytics" });
  }
};

module.exports = { getOverview, getListings, moderateListing, getMembers, updateMemberStatus, getReports, resolveReport, getSwapActivity, exportAnalytics };
