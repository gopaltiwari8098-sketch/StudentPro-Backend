import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import studentRoutes from "./Routes/studentRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";   // 🔒 Security middleware
import morgan from "morgan";   // 📜 Logging

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ✅ Security Middleware
app.use(helmet());
app.use(morgan("dev"));

// ✅ CORS Setup — Works perfectly for Render + Netlify + Localhost
const allowedOrigins = [
  "https://studentpro-app.netlify.app", // ✅ Netlify frontend
  "http://localhost:5500",              // ✅ Local testing
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/students", studentRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 StudentPro Backend is Live & Secure on Render!");
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT} in ${process.env.NODE_ENV || "production"} mode`)
);
