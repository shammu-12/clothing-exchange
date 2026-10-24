const express = require("express");
const protect = require("../middleware/authMiddleware");
const { paymentConfig, createCourierOrder, verifyCourierPayment, getCourierPaymentStatus } = require("../controllers/paymentController");

const router = express.Router();
router.get("/config", paymentConfig);
router.post("/courier/order", protect, createCourierOrder);
router.post("/courier/verify", protect, verifyCourierPayment);
router.get("/courier/:swapId", protect, getCourierPaymentStatus);

module.exports = router;
