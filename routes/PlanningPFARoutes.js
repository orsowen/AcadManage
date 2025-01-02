import express from "express";
import {
  generateSoutenances,
  getPlanningByStudent,
  getPlanningByTeacher,
  updateSoutenance,
  publishSoutenance,
  sendEmail,
  getSoutenancesForTeacher,
  getSubjectByIdForTeacher
} from "../controllers/PlanningPFA.js";
import { isAdmin, isTeacher } from "../middlewares/authentication.js";
const router = express.Router();

// POST /planning-PFA - Create a new planning PFA
router.post("/Soutenances", isAdmin, generateSoutenances);
// Route for teacher
router.get("/planning/teacher/:teacherId", isAdmin, getPlanningByTeacher);
// Route for Student
router.get("/planning/student/:studentId", isAdmin, getPlanningByStudent);
// update pfa soutenance
router.patch("/:id/soutenances", isAdmin, updateSoutenance);
// Route pour publier/masquer les soutenances
router.post("/publish/:response", isAdmin, publishSoutenance);
// Route pour envoyer les emails
router.post("/list/send/:option", sendEmail);

// Route to get soutenances  for the authenticated teacher
router.get('/soutenances/teacher',isTeacher, getSoutenancesForTeacher);

// Route to get soutenances details for the authenticated teacher
router.get('/soutenances/:id/teacher',isTeacher, getSubjectByIdForTeacher);

export default router;
