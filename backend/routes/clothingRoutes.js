const express = require("express");

const {
  addClothing,
  getAllClothing,
  getMyClothing,
  getClothingById,
  updateClothing,
  deleteClothing,
} = require("../controllers/clothingController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET ALL CLOTHING
// ==========================================

router.get(
  "/",
  getAllClothing
);

// ==========================================
// GET MY CLOTHING
// IMPORTANT: Keep this BEFORE /:id
// ==========================================

router.get(
  "/my",
  protect,
  getMyClothing
);

// ==========================================
// GET SINGLE CLOTHING
// Example: /api/clothing/65abc123...
// ==========================================

router.get(
  "/:id",
  getClothingById
);

// ==========================================
// ADD CLOTHING
// ==========================================

router.post(
  "/",
  protect,
  addClothing
);

router.put("/:id", protect, updateClothing);
router.delete("/:id", protect, deleteClothing);

module.exports = router;
