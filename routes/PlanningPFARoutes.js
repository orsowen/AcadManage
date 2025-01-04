import express from "express";
import {
  generateSoutenances,
  getPlanningByStudent,
  getPlanningByTeacher,
  updateSoutenance,
  publishSoutenance,
  sendEmail,
  getSoutenancesForTeacher,
  getSoutenanceDetailsForStudent,
  getSubjectByIdForTeacher,
} from "../controllers/PlanningPFA.js";
import {
  isAdmin,
  isTeacher,
  isStudent,
} from "../middlewares/authentication.js";
const router = express.Router();

// POST /planning-PFA - Create a new planning PFA
router.post("/Soutenances", isAdmin, generateSoutenances);
// Route for teacher
router.get("/planning/teacher/:teacherId", isAdmin, getPlanningByTeacher);
// Route for Student
router.get("/planning/student/:studentId", isAdmin, getPlanningByStudent);
// update pfa soutenance
router.patch("/:id/soutenances", isAdmin, updateSoutenance);

// Route pour envoyer les emails
router.post("/list/send", sendEmail);
// Route pour recuperer les soutenance par etudiant
router.get(
  "/student/soutenance",
  isStudent,
  getSoutenanceDetailsForStudent
);

// Route to get soutenances  for the authenticated teacher a
router.get("/soutenances/teacher", isTeacher, getSoutenancesForTeacher);

// Route to get soutenances details for the authenticated teacher a
router.get("/soutenances/:id/teacher", isTeacher, getSubjectByIdForTeacher);




// Route pour publier/masquer les soutenances
router.post("/PublishSoutenance/:response", isAdmin, publishSoutenance);

export default router;
