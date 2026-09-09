require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const resultRoutes = require("./routes/resultRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const contentRoutes = require("./routes/contentRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any local loopback ports during local development
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS policy violation: Origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/content", contentRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT} (accessible at http://localhost:${PORT} and http://127.0.0.1:${PORT})`);
});
