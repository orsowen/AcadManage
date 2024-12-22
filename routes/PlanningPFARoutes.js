import express from "express";
import {
  generateSoutenances,
  getPlanningByStudent,
  getPlanningByTeacher,
  updateSoutenance,
} from "../controllers/PlanningPFA.js";
import { isAdmin } from "../middlewares/authentication.js";
const router = express.Router();

// POST /planning-PFA - Create a new planning PFA
router.post("/Soutenances", isAdmin, generateSoutenances);
// Route for teacher
router.get("/planning/teacher/:teacherId", isAdmin, getPlanningByTeacher);
// Route for Student
router.get("/planning/student/:studentId", isAdmin, getPlanningByStudent);
// update pfa soutenance
router.patch("/:id/soutenances", isAdmin, updateSoutenance);
export default router;
