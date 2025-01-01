import Student from "../models/Student.js";
import Teachers from "../models/Teachers.js";
import { generateRandomPassword, sendCreds } from "./UserController.js";

export const updateGraduationdByID = async (req, res) => {
  try {
    const { id } = req.params; // Extract the student ID from URL params
    const { status } = req.body; // Extract the new status from the request body
    let savedstatus;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextYear = currentDate.getMonth() < 8 ? currentYear : currentYear+1;
    const academicYear = `${nextYear-1}-${nextYear}`;

    // Find the student by ID
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    if (student.isGraduated){
      return res.status(404).json({ message: "the Student is already graduated" });
    }

    // Validate input
    const validstatuss = ["Success", "Failure", "Pending"];
    if (!status || !validstatuss.includes(status)) {
      return res.status(400).json({message: 'Invalid status. Use "Success", "Failure", "Pending". the first character must be uppercase'});
    }

    // Update the student status
    student.academicHistory.forEach(entry => { 
      if (entry.year === academicYear)
      {
        entry.status = status;
        savedstatus = entry.status
      }
    })

    await student.save();

    res.status(200).json({
      message: "Student situation updated successfully.",
      student: {
        name: `${student.firstName} ${student.lastName}`,
        status: savedstatus,
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
        const yearExists = student.academicHistory.some(entry => (entry.year === academicYear));
        if (yearExists || student.isGraduated ) {
          yearExists? console.warn(`Year ${academicYear} already exists for student ${student._id}. Skipping.`):console.warn(`Student ${student._id} already graduated. Skipping.`);
          continue;
        }

        // Add the new year to the academicHistory
        student.academicHistory.push({
            year : academicYear,
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
        message: `Academic year ${academicYear} added to all students successfully.`,
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
