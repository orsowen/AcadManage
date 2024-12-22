import express from "express";
import { generateSoutenances } from "../controllers/PlanningPFA.js";
import { isAdmin } from "../middlewares/authentication.js";
const router = express.Router();

// POST /planning-PFA - Create a new planning PFA
router.post("/Soutenances", generateSoutenances);

export default router;
