import express from "express";
import {
  generateSoutenances,
  getPlanningByStudent,
  getPlanningByTeacher,
} from "../controllers/PlanningPFA.js";
import { isAdmin } from "../middlewares/authentication.js";
const router = express.Router();

// POST /planning-PFA - Create a new planning PFA
router.post("/Soutenances", isAdmin, generateSoutenances);
// Route for teacher
router.get("/planning/teacher/:teacherId", getPlanningByTeacher);
// Route for Student
router.get("/planning/student/:studentId", getPlanningByStudent);

export default router;
