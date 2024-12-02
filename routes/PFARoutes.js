// add PFA routes
import {
  createSubjects,
  getSubjects,
  updateSubject,
  deleteSubject,
  rejectSubject,
  publishSubjects,
  approveSubject,
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
router.patch("/PFA/approve/:id", approveSubject);

export default router;
