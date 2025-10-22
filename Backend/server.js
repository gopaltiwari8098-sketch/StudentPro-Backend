import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import studentRoutes from "./Routes/studentRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer"; // New: For handling file uploads

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(morgan("dev"));

// ✅ Correct CORS config
app.use(cors({
  origin: [
    "https://studentpro-app.netlify.app",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Static folder for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// New: Multer storage config (used in routes)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit, matching frontend
});

// Pass upload to studentRoutes (update your studentRoutes.js to use it)
app.use("/api/students", studentRoutes(upload)); // Pass upload middleware

app.get("/", (req, res) => {
  res.send("🚀 StudentPro Backend Running Smoothly!");
});

app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: "Server Error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running in ${process.env.NODE_ENV || "production"} mode on port ${PORT}`)
);