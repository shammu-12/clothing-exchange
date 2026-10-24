const Clothing = require("../models/Clothing");
const SwapRequest = require("../models/SwapRequest");
const User = require("../models/User");

const getOverview = async (req, res) => {
  try {
    const [users, listings, swaps, pending] = await Promise.all([
      User.countDocuments(),
      Clothing.countDocuments({ status: "Available" }),
      SwapRequest.countDocuments({ status: "Completed" }),
      SwapRequest.countDocuments({ status: "Pending" }),
    ]);
    res.json({ users, listings, successfulSwaps: swaps, pendingSwaps: pending });
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

module.exports = { getOverview, getListings, moderateListing };
