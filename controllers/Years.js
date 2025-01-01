import Student from "../models/Student";
import Teachers from "../models/Teachers";
import { generateRandomPassword, sendCreds } from "./UserController.js";

export const updateGraduationdByID = async (req, res) => {
  try {
    const { id } = req.params; // Extract the student ID from URL params
    const { situation } = req.body; // Extract the new situation from the request body

    // Find the student by ID
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.isGraduated){
      return res.status(404).json({ message: "the Student is already graduated" });
    }

    // Validate input
    const validSituations = ['Success', 'Failure', 'Pending'];
    if (!situation || !validSituations.includes(situation.toLowerCase())) {
      return res.status(400).json({message: 'Invalid situation. Use "Success", "Failure", "Pending".'});
    }

    // Update the student situation
    student.situation = situation.toLowerCase();
    await student.save();

    res.status(200).json({
      message: "Student situation updated successfully.",
      student: {
        name: `${student.firstName} ${student.lastName}`,
        situation: student.situation,
      },
    });
  } catch (error) {
    console.error("Error updating student situation:", error.message);
    res
      .status(500)
      .json({
        message: "Server error while updating student situation.",
        error: error.message,
      });
  }
};

export const addAcademicYearToAllStudents = async (req, res) => {
  try {
    // Get the current academic year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextYear = currentDate.getMonth() >= 8 ? currentYear + 1 : currentYear;
    const academicYear = `${nextYear - 1}-${nextYear}`

    // get all students
    const students = await Student.find(); // Retrieve all students
    const updatedStudents = [];

    for (const student of students) {
        // Check if the year already exists in the academicHistory
        const yearExists = student.academicHistory.some(entry => (entry.year === academicYear ||  (entry.year === lastAcademicYear && entry.status === "failure")));
        if (yearExists || student.isGraduated ) {
          yearExists? console.warn(`Year ${year} already exists for student ${student._id}. Skipping.`):console.warn(`Student ${student._id} already graduated. Skipping.`);
          continue;
        }

        // Add the new year to the academicHistory
        student.academicHistory.push({
            academicYear,
            status: 'Pending', // Default status
        });

        // Save the student
        await student.save();
        updatedStudents.push({
            id: student._id,
            name: `${student.firstName} ${student.lastName}`,
            updatedAcademicHistory: student.academicHistory,
        });
    }

    res.status(200).json({
        message: `Academic year ${year} added to all students successfully.`,
        updatedStudents,
    });
} catch (error) {
    console.error('Error adding academic year to all students:', error.message);
    res.status(500).json({ message: 'Server error while updating academic history.', error: error.message });
}
};

export const sendNotification = async (req, res) => {
  try {
  } catch {}
};
