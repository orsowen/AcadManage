import express from "express";
import {
  addChoice,
  getChoices,
  updatePriority,
  updateTeacherAcceptance,
  getChoiceById,
  getSubjectByIdForTeacher
} from "../controllers/ChoiceController.js";

import { isStudent } from "../middlewares/authentication.js";

const router = express.Router();

// Route pour ajouter un choix de sujet student
router.post("/choices", isStudent, addChoice);

// Route pour obtenir les choix de sujets d'un étudiant  4.1
router.get("/choices", isStudent, getChoices);

// Route pour obtenir un choix specifique d'un étudiant 5.1
router.get("/choices/:id", isStudent, getChoiceById);

router.patch("/choices/acceptation", isStudent, updateTeacherAcceptance);
// // Route pour lister les PFA choisis par l'étudiant
// router.get("/PFAChoices", isStudent, getStudentSubjects);

export default router;
