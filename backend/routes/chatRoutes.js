const express = require("express");
const protect = require("../middleware/authMiddleware");
const { getMessages, sendMessage } = require("../controllers/chatController");

const router = express.Router();
router.get("/:swapId", protect, getMessages);
router.post("/:swapId", protect, sendMessage);

module.exports = router;
