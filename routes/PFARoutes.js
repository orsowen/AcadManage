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
} from "../controllers/PFAController.js";
import express from "express";

const router = express.Router();

// Route to create multiple subjects
router.post("/PFA/post", createSubjects);

// Route to get all subjects
router.get("/PFA/mine", getSubjects);

// Route to update a subject
router.patch("/PFA/:id", updateSubject);

// Route to delete a subject
router.delete("/PFA/:id", deleteSubject);

// Route to publish subjects and open choice period
router.post("/PFA/publish", publishSubjects);

// Route to reject a subject
router.patch("/PFA/reject/:id", rejectSubject);

// Route to approve a subject
router.patch("/PFA/approve/:id", approveSubject);

// Route to handle first send option
router.get("/PFA/first-send", firstSend);

// Route to handle modified send option
router.get("/PFA/modified-send", modifiedSend);
//Route to list subjects by teachers
router.get("/PFA/teacher/:teacherId", PFASubjectsByTeacher);

export default router;
