const express = require("express");
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, file.mimetype.startsWith("image/")),
});

router.post("/image", protect, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Please choose an image file" });
  res.status(201).json({ image: `/uploads/${req.file.filename}` });
});

module.exports = router;
