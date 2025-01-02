import express from "express";
import {
  generateSoutenances,
  getPlanningByStudent,
  getPlanningByTeacher,
  updateSoutenance,
  publishSoutenance,
  sendEmail,
  getSoutenanceDetailsForStudent,
} from "../controllers/PlanningPFA.js";
import { isAdmin, isStudent } from "../middlewares/authentication.js";
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
// Route pour recuperer les soutenance par etudiant
router.get(
  "/student/:studentId/soutenance",
  isStudent,
  getSoutenanceDetailsForStudent
);

export default router;
