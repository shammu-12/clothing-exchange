const express = require("express");

const {
  createSwapRequest,
  getMySentRequests,
  getReceivedRequests,
  updateSwapRequest,
  getSwapDetails,
  updateSwapShipping,
  confirmSwapCompletion,
} = require("../controllers/swapController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Send request
router.post(
  "/",
  protect,
  createSwapRequest
);

// Requests I sent
router.get(
  "/sent",
  protect,
  getMySentRequests
);

// Requests I received
router.get(
  "/received",
  protect,
  getReceivedRequests
);

router.get("/:id", protect, getSwapDetails);

// Accept / Reject
router.put(
  "/:id",
  protect,
  updateSwapRequest
);

router.patch("/:id/shipping", protect, updateSwapShipping);
router.post("/:id/completion", protect, confirmSwapCompletion);

module.exports = router;
