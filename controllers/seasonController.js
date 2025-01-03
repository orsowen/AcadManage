import Student from "../models/Student.js"
import Subject from "../models/Subject.js"
import PFE from "../models/PFE.js"
import PFA from "../models/Subject_PFA.js"
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

export const addNewAcademicYear = async (req, res) => {
  try {
    // Get the current academic year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const nextYear = currentDate.getMonth() >= 8 ? currentYear + 1 : currentYear;
    const academicYear = `${nextYear - 1}-${nextYear}`

    // get all students
    const students = await Student.find(); // Retrieve all students
    const updatedStudents = [];

    // get all students
    const pfes = await PFE.find(); // Retrieve all students
    const pfas = await PFA.find(); // Retrieve all students
    const subjects = await Subject.find(); // Retrieve all students
    const archivedSubjects= [];

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

    for (const pfe of pfes) {
      // Check if the year already exists in the academicHistory
      if (!pfe.isArchived) 
      {
        continue
      }

      if (pfe.isValid) {
        pfe.isArchived = true
      }else
      {
        console.warn(`pfe ${pfe._id} is not validated. Skipping.`)
        continue
      }

      // Save the pfe
      await pfe.save();
      archivedSubjects.push({
        type : "pfe",
        id: pfe._id,
        title: pfe.title,
        message: "archived with success",
      });
      }

    for (const pfa of pfas) {
      // Check if the year already exists in the academicHistory
      if (!pfa.isArchived) 
      {
        continue
      }

      if (pfa.status === "Approved") {
        pfa.isArchived = true
      }else
      {
        console.warn(`pfa ${pfa._id} is ${pfa.status}. Skipping.`)
        continue
      }

      // Save the pfa
      await pfa.save();
      archivedSubjects.push({
        type : "pfa",
        id: pfa._id,
        title: pfa.title,
        message: "archived with success",
      });
      }

    res.status(200).json({
        message: `Academic year ${academicYear} added to all students successfully and all subject was archived.`,
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
