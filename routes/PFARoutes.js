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
import { isAdmin, isStudent, isTeacher, loggedMiddleware } from "../middlewares/authentification.js";

const router = express.Router();

// Route to create multiple subjects
router.post("/post", loggedMiddleware , isTeacher , createSubjects);

// Route to get all subjects Admin
router.get("",loggedMiddleware,isAdmin, getSubjects);

// route to get a subject by id Admin
router.get("/:id",loggedMiddleware,isAdmin, getSubjectById);

// Route to get all subjects teacher
router.get("/mine",loggedMiddleware , isTeacher , getSubjects);

// route to get a subject by id teacher
router.get("/:id/mine", loggedMiddleware , isTeacher ,  getSubjectById);

// Route to update a subject  teacher
router.patch("/:id", loggedMiddleware , isTeacher , updateSubject);

// Route to delete a subject teacher
router.delete("/:id", loggedMiddleware , isTeacher , deleteSubject);

// Route to publish subjects and open choice period for students admin
router.post("/publish",loggedMiddleware,isAdmin, publishSubjects);

// Route to reject a subject  admin
router.patch("/reject/:id",loggedMiddleware,isAdmin,  rejectSubject);

// Route to approve a subject admin
router.patch("/approve/:id",loggedMiddleware,isAdmin,  approveSubject);

// Route to handle first send option  admin
router.get("/first-send", firstSend);

// Route to handle modified send option
router.get("/modified-send", modifiedSend);

//Route to list subjects by teachers student 
router.get("/teacher/:teacherId",loggedMiddleware,isStudent,  PFASubjectsByTeacher);


export default router;
