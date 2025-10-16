import express from "express";
import multer from "multer";
import path from "path";
import { createStudent, getStudents, updateStudent, deleteStudent } from "../Controllers/studentController.js";

const router = express.Router();

// Ensure uploads folder exists
import fs from "fs";
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

// Routes
router.post("/", upload.single("avatar"), createStudent);
router.get("/", getStudents);
router.put("/:id", upload.single("avatar"), updateStudent);
router.delete("/:id", deleteStudent);

export default router;
