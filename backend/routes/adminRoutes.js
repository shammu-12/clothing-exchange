const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const { getOverview, getListings, moderateListing } = require("../controllers/adminController");

const router = express.Router();
router.use(protect, requireAdmin);
router.get("/overview", getOverview);
router.get("/listings", getListings);
router.patch("/listings/:id", moderateListing);

module.exports = router;
