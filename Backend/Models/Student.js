import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  course: String,
  branch: String, 
  age: Number,
  rollNumber: String,
  phone: String,
  department: String,
  gpa: Number,
  skills: String,
  achievements: String,
  portfolio: String,
  avatar: String, // store file path
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Student", studentSchema);
