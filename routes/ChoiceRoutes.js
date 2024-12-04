import express from 'express';
import { addChoice, getChoices } from '../controllers/ChoiceController.js';


const router = express.Router();

// Route pour ajouter un choix de sujet
router.post('/choices', addChoice);

// Route pour obtenir les choix de sujets d'un étudiant
router.get('/choices/:studentId', getChoices);

export default router;