const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Database
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const clothingRoutes = require("./routes/clothingRoutes");
const swapRoutes = require("./routes/swapRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const communityRoutes = require("./routes/communityRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();

// ==========================================
// CONNECT DATABASE
// ==========================================

connectDB();

// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();

const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map((origin) => (/^https?:\/\//i.test(origin) ? origin : `https://${origin}`));
clientOrigins.push("https://localhost", "capacitor://localhost");

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: clientOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Clothing Exchange Backend is running successfully",
  });
});

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

// ==========================================
// CLOTHING ROUTES
// ==========================================

app.use(
  "/api/clothing",
  clothingRoutes
);

// ==========================================
// SWAP REQUEST ROUTES
// ==========================================

app.use(
  "/api/swaps",
  swapRoutes
);

app.use("/api/messages", chatRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/payments", paymentRoutes);

// ==========================================
// 404 ROUTE
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    message: "Internal server error",
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
