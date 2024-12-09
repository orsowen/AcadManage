import express from 'express';
import { addChoice, getChoices , updatePriority , updateTeacherAcceptance} from '../controllers/ChoiceController.js';
import { loggedMiddleware } from '../middlewares/authentification.js';
import { isStudent  } from '../middlewares/authentification.js';


const router = express.Router();

// Route pour ajouter un choix de sujet student
router.post('/choices',loggedMiddleware, isStudent,  addChoice);

// Route pour obtenir les choix de sujets d'un étudiant 
router.get('/choices/:studentId',loggedMiddleware, isStudent,  getChoices);

// Route pour mettre à jour la priorité d'un choix de sujet
router.patch('/choices/updatePriority', loggedMiddleware, isStudent, updatePriority);

// Route pour mettre à jour l'acceptation par l'enseignant
router.patch('/choices/acceptation', loggedMiddleware, isStudent, updateTeacherAcceptance);

export default router;