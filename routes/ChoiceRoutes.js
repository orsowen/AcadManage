import express from 'express';
import { addChoice, getChoices , updatePriority , updateTeacherAcceptance} from '../controllers/ChoiceController.js';


const router = express.Router();

// Route pour ajouter un choix de sujet
router.post('/choices', addChoice);

// Route pour obtenir les choix de sujets d'un étudiant
router.get('/choices/:studentId', getChoices);

// Route pour mettre à jour la priorité d'un choix de sujet
router.patch('/choices/updatePriority', updatePriority);

// Route pour mettre à jour l'acceptation par l'enseignant
router.patch('/choices/acceptation', updateTeacherAcceptance);

export default router;