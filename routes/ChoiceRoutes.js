import express from "express";
import {
  addChoice,
  getChoices,
  updatePriority,
  updateTeacherAcceptance,
  //getStudentSubjects,
} from "../controllers/ChoiceController.js";

import { isStudent } from "../middlewares/authentication.js";

const router = express.Router();

// Route pour ajouter un choix de sujet student
router.post("/choices", isStudent, addChoice);

// Route pour obtenir les choix de sujets d'un étudiant
router.get("/choices/:studentId", isStudent, getChoices);

// Route pour mettre à jour la priorité d'un choix de sujet
router.patch("/choices/updatePriority", isStudent, updatePriority);

// Route pour mettre à jour l'acceptation par l'enseignant
router.patch("/choices/acceptation", isStudent, updateTeacherAcceptance);
// // Route pour lister les PFA choisis par l'étudiant
// router.get("/PFAChoices", isStudent, getStudentSubjects);

export default router;
