import Student from "../models/Student.js"
import Internship from "../models/Internship.js"
import PFE from "../models/PFE.js"
import PFA from "../models/Subject_PFA.js"
import Teachers from "../models/Teachers.js";
import {sendCreds } from "./UserController.js";
import { sendMail } from './mailer.js';
import User from "../models/User.js";


export async function sendNotification(email) {
    if (!email) {
        console.warn("Email address is required to send credentials.");
        return;
    }

    const subject = "Rappel de mettre à jour vos info";

    const message = `
        <p>Bonjour,</p>
        <p>Nous espérons que vous allez bien. En tant qu'ancien(ne) diplômé(e) de l'ISAMM, nous vous contactons pour vous rappeler de mettre à jour vos informations personnelles dans notre base de données. </p>
        <p>Nous vous rappelons qu'il est important de mettre à jour vos informations personnelles afin de garantir la bonne gestion de votre compte et de continuer à bénéficier de nos services sans interruption.</p>
        <b>NB : utilisez votre CIN comme login</b>
        <p>Cordialement,</p>
        <p>L'équipe de gestion.</p>
    `;

    try {
        await sendMail(email, subject, message);
        console.log(`notification sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send notification email to ${email}:`, error);
    }
}

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

    // update all pfes
    const pfes = await PFE.updateMany(
      {isArchived : false, isValid : true },
      {$set: {isArchived : true}}
    ) 
    
    /*// update all pfas
    const pfas = await PFA.updateMany(
      {isArchived : false, status : "Approved" },
      {$set: {isArchived : true}}
    ) */
    
    // update all internships
    const internships = await Internship.updateMany(
      {isArchived : false, isValid : true },
      {$set: {isArchived : true}}
    )

    res.status(200).json({
        message: `Academic year ${academicYear} added to all students successfully and all subject was archived.`,
        updatedStudents,
        pfes,
        pfas,
        internships
    });

} catch (error) {
    console.error('Error adding academic year:', error.message);
    res.status(500).json({ message: 'Server error while updating academic history.', error: error.message });
}
};

export const NotifiGraduatedStudent = async (req, res) => {
  try {

    // get all students
    const students = await Student.find(); // Retrieve all students
    const notifiedtudents = [];

    for (const student of students) {
      const user = await User.findById(student.user);
      if (!student.isGraduated) {
        //console.warn(`Student ${student._id} is not graduated.`)
        continue
      }

      sendNotification(user.email);
      console.warn(`send email to student ${student._id}.`)

      notifiedtudents.push({
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        email: user.email
      });

      res.status(200).json({
        message: "notifications send successfully.",
        student: notifiedtudents,
      })
  }
  } catch(error) {
    console.error('Error sendng notification :', error.message);
    res.status(500).json({ message: 'Server error while sending notification.', error: error.message });
  }
};
