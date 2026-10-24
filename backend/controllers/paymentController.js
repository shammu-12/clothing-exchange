const crypto = require("crypto");
const Payment = require("../models/Payment");
const SwapRequest = require("../models/SwapRequest");

const configured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const razorpayRequest = async (path, options = {}) => {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.description || "Razorpay could not process the request");
  return data;
};

const paymentConfig = (req, res) => {
  res.json({ enabled: configured(), keyId: configured() ? process.env.RAZORPAY_KEY_ID : "", currency: "INR" });
};

const createCourierOrder = async (req, res) => {
  try {
    if (!configured()) return res.status(503).json({ message: "Online payments are not configured. Add Razorpay test or live keys on the API server." });
    const swap = await SwapRequest.findById(req.body.swapId);
    if (!swap) return res.status(404).json({ message: "Swap not found" });
    if (swap.status !== "Accepted" || swap.deliveryMode !== "Remote") return res.status(409).json({ message: "Courier payment is available for accepted remote swaps only" });
    if (![swap.requester.toString(), swap.owner.toString()].includes(req.user.id)) return res.status(403).json({ message: "Only swap participants can pay courier costs" });
    const shipment = swap.shipments.find((entry) => entry.sender.toString() === req.user.id);
    if (!shipment) return res.status(400).json({ message: "Save your remote courier details first" });
    if (!Number.isInteger(shipment.courierFee) || shipment.courierFee < 1 || shipment.courierFee > 100000) return res.status(400).json({ message: "Enter an agreed courier amount between ₹1 and ₹1,00,000 first" });

    let payment = await Payment.findOne({ swap: swap._id, payer: req.user.id });
    if (payment?.status === "Paid") return res.json({ paid: true, message: "Courier contribution already paid" });
    if (payment && payment.amountPaise !== shipment.courierFee * 100) return res.status(409).json({ message: "A payment order already exists for a different saved courier amount. Contact support before changing it." });
    if (!payment) {
      const order = await razorpayRequest("/orders", { method: "POST", body: JSON.stringify({ amount: shipment.courierFee * 100, currency: "INR", receipt: `rw_${swap._id.toString().slice(-12)}_${req.user.id.slice(-8)}` }) });
      payment = await Payment.create({ swap: swap._id, payer: req.user.id, amountPaise: order.amount, currency: order.currency, orderId: order.id });
    }
    res.json({ paid: false, keyId: process.env.RAZORPAY_KEY_ID, orderId: payment.orderId, amount: payment.amountPaise, currency: payment.currency, merchantName: "Rewear" });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "A payment for this swap is already being prepared. Refresh and try again." });
    console.error("Create courier payment order error:", error.message);
    res.status(502).json({ message: error.message || "Unable to create the payment order" });
  }
};

const verifyCourierPayment = async (req, res) => {
  try {
    if (!configured()) return res.status(503).json({ message: "Online payments are not configured" });
    const { orderId, paymentId, signature } = req.body;
    if (![orderId, paymentId, signature].every((value) => typeof value === "string" && value.length > 0)) return res.status(400).json({ message: "Payment verification details are incomplete" });
    const payment = await Payment.findOne({ orderId, payer: req.user.id });
    if (!payment) return res.status(404).json({ message: "Payment order not found for this account" });
    if (payment.status === "Paid") return res.json({ paid: true, message: "Payment verified" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${payment.orderId}|${paymentId}`).digest();
    const supplied = Buffer.from(signature, "hex");
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) return res.status(400).json({ message: "Payment signature could not be verified" });
    const providerPayment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
    if (providerPayment.order_id !== payment.orderId || providerPayment.amount !== payment.amountPaise || providerPayment.currency !== payment.currency || providerPayment.status !== "captured") {
      return res.status(409).json({ message: "Payment is not captured yet. Check Razorpay capture settings and try again." });
    }
    payment.paymentId = paymentId;
    payment.status = "Paid";
    await payment.save();
    res.json({ paid: true, message: "Courier contribution paid and verified" });
  } catch (error) {
    console.error("Verify courier payment error:", error.message);
    res.status(502).json({ message: error.message || "Unable to verify payment" });
  }
};

const getCourierPaymentStatus = async (req, res) => {
  const payment = await Payment.findOne({ swap: req.params.swapId, payer: req.user.id });
  res.json({ paid: payment?.status === "Paid", amountPaise: payment?.amountPaise || null });
};

module.exports = { paymentConfig, createCourierOrder, verifyCourierPayment, getCourierPaymentStatus };
