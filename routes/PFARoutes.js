// add PFA routes
import {
  createSubjects,
  getSubjects,
  updateSubject,
  deleteSubject,
  rejectSubject,
  publishSubjects,
  approveSubject,
  firstSend,
  modifiedSend,
  getAllSubjectsForStudent,
  getSubjectById,
  getSubjectsByTeacher,
  PFASubjectsByTeacher,
  getSubjectByIdForTeacher,
} from "../controllers/PFAController.js";
import express from "express";
import {
  isAdmin,
  isStudent,
  isTeacher,
} from "../middlewares/authentication.js";

const router = express.Router();

//Route to list subjects by teachers student
router.get("/PFASubjects", isStudent, getAllSubjectsForStudent);

// Route to create multiple subjects
router.post("/post", isTeacher, createSubjects);

// // Route to get all subjects Admin
router.get("/", isAdmin, getSubjects);

// Route to get all subjects teacher
router.get("/mine", isTeacher, getSubjectsByTeacher);

// // route to get a subject by id Admin
router.get("/:id", isAdmin, getSubjectById);

// route to get a subject by id teacher
router.get("/:id/mine", isTeacher, getSubjectByIdForTeacher);

// Route to update a subject  teacher
router.patch("/:id", isTeacher, updateSubject);

// Route to delete a subject  by teacher
router.delete("/:id/mine", isTeacher, deleteSubject);

// Route to update a subject by teacher
router.patch("/:id/mine", isTeacher, updateSubject);

// Route to publish subjects and open choice period for students admin
router.post("/publish", isAdmin, publishSubjects);

// Route to reject a subject  admin
router.patch("/reject/:id", isAdmin, rejectSubject);

// Route to approve a subject admin
router.patch("/approve/:id", isAdmin, approveSubject);

// Route to handle first send option  admin
router.get("/first-send", firstSend);

// Route to handle modified send option
router.get("/modified-send", modifiedSend);

//Route to list subjects by teachers student
router.get("/teacher/:teacherId", isStudent, PFASubjectsByTeacher);

export default router;
