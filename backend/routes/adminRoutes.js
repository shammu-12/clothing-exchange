const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const { getOverview, getListings, moderateListing, getMembers, updateMemberStatus, getReports, resolveReport, getSwapActivity, exportAnalytics } = require("../controllers/adminController");

const router = express.Router();
router.use(protect, requireAdmin);
router.get("/overview", getOverview);
router.get("/analytics.csv", exportAnalytics);
router.get("/members", getMembers);
router.patch("/members/:id", updateMemberStatus);
router.get("/reports", getReports);
router.patch("/reports/:id", resolveReport);
router.get("/swaps", getSwapActivity);
router.get("/listings", getListings);
router.patch("/listings/:id", moderateListing);

module.exports = router;
