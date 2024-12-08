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
  PFASubjectsByTeacher,
  getSubjectById,
} from "../controllers/PFAController.js";
import express from "express";

const router = express.Router();

// Route to create multiple subjects
router.post("/PFA/post", createSubjects);

// Route to get all subjects Admin
router.get("/PFA", getSubjects);

// route to get a subject by id Admin
router.get("/PFA/:id", getSubjectById);

// Route to get all subjects teacher
router.get("/PFA/mine", getSubjects);

// route to get a subject by id teacher
router.get("/PFA/:id/mine", getSubjectById);

// Route to update a subject  teacher
router.patch("/PFA/:id", updateSubject);

// Route to delete a subject teacher
router.delete("/PFA/:id", deleteSubject);

// Route to publish subjects and open choice period for students admin
router.post("/PFA/publish", publishSubjects);

// Route to reject a subject  admin
router.patch("/PFA/reject/:id", rejectSubject);

// Route to approve a subject admin
router.patch("/PFA/approve/:id", approveSubject);

// Route to handle first send option  admin
router.get("/PFA/first-send", firstSend);

// Route to handle modified send option
router.get("/PFA/modified-send", modifiedSend);

//Route to list subjects by teachers student 
router.get("/PFA/teacher/:teacherId", PFASubjectsByTeacher);

export default router;
