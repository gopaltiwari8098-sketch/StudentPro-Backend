import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import studentRoutes from "./Routes/studentRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";   // 🔒 security middleware
import morgan from "morgan";   // 📜 logging

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// ✅ Security Middleware
app.use(helmet());
app.use(morgan("dev"));

// ✅ CORS setup
app.use(cors({
  origin: [
    "https://studentpro-app.netlify.app",  // your frontend domain
    "http://localhost:5500"                // for local testing
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ API routes
app.use("/api/students", studentRoutes);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("🚀 StudentPro Backend Running with Security & Logging");
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: "Server Error", error: err.message });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running in ${process.env.NODE_ENV || "production"} mode on port ${PORT}`)
);
