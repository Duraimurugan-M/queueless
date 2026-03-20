const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();

// Required for Render/Railway/any proxy — fixes rate limiter X-Forwarded-For warning
app.set('trust proxy', 1);

// Fix: explicit origin required when frontend uses credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ✅ Health check route (ADD HERE)
app.get("/", (req, res) => {
  res.status(200).send("QueueLess Backend Running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    message: "Server is healthy ✅",
    timestamp: new Date()
  });
});

// ✅ Rate limiter — 100 requests per minute for public (unauthenticated) users
// Applied ONLY to /api/auth (register, login, forgot-password, reset-password)
// Authenticated dashboard routes (doctor, patient, md) are NOT limited here
const publicRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100,                  // max 100 requests per IP per window
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP. Please wait a minute and try again.",
  },
  // Skip rate limit for already-authenticated requests (has Authorization header)
  skip: (req) => !!req.headers["authorization"],
});

// Apply rate limiter only to public auth routes
app.use("/api/auth", publicRateLimiter, require("./routes/authRoutes"));

// ✅ Authenticated routes — no public rate limit (JWT middleware protects them)
app.use("/api/md", require("./routes/mdRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/patient", require("./routes/patientRoutes"));
app.use("/api/token", require("./routes/tokenRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

module.exports = app;
