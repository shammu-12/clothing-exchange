const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getCommunity, createCommunityPost, toggleLike, deleteCommunityPost } = require("../controllers/communityController");

const router = express.Router();
router.get("/", getCommunity);
router.post("/", protect, createCommunityPost);
router.post("/:id/like", protect, toggleLike);
router.delete("/:id", protect, deleteCommunityPost);

module.exports = router;
