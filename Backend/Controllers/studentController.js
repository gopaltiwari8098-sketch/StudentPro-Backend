import Student from "../Models/Student.js";

// Create Student
export const createStudent = async (req, res) => {
  try {
    const data = cleanStudentData(req);

    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Students
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Student
export const updateStudent = async (req, res) => {
  try {
    const data = cleanStudentData(req);

    // Preserve old avatar if not uploaded
    if (!req.file) {
      const oldStudent = await Student.findById(req.params.id);
      if (oldStudent) {
        data.avatar = oldStudent.avatar;
      }
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Student
export const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper to clean and prepare student data
function cleanStudentData(req) {
  const body = req.body;
  const data = {
    name: body.name?.trim(),
    email: body.email?.trim(),
    course: body.course?.trim(),
    age: body.age ? Number(body.age) : null,
    rollNumber: body.rollNumber?.trim(),
    phone: body.phone?.trim(),
    department: body.department?.trim(),
    gpa: body.gpa ? Number(body.gpa) : null,
    skills: body.skills?.trim(),
    achievements: body.achievements?.trim(),
    portfolio: body.portfolio?.trim(),
  };

  if (req.file) {
    data.avatar = `/uploads/${req.file.filename}`;
  }

  return data;
}
