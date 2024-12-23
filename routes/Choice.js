import express from 'express';
import { addChoice, getChoices , updatePriority , updateTeacherAcceptance , getChoiceById, getStudentChoices ,clearAllStudentChoices,autoAssignChoices,assignPFAtoStudent } from '../controllers/Choice.js';

import { isAdmin, isStudent, isTeacher  } from '../middlewares/authentication.js';


const router = express.Router();

// Route pour obtenir un choix specifique d'un étudiant by admin
router.get('/choices/:id', isAdmin, getStudentChoices);

// Route pour ajouter un choix de sujet student
router.post('/choices', isStudent,  addChoice);

// Route pour obtenir les choix de sujets d'un étudiant  4.1
router.get('/choices', isStudent,  getChoices);

// Route pour obtenir un choix specifique d'un étudiant 5.1
router.get('/choices/:id', isStudent, getChoiceById);

// Route pour mettre à jour la priorité d'un choix de sujet
router.patch('/choices/updatePriority', isStudent, updatePriority);

// Route pour mettre à jour l'acceptation par l'enseignant
router.patch('/choices/acceptation', isStudent, updateTeacherAcceptance);

// Route pour affecter automatiquement les choix de tous les étudiants
router.post('/PFA/choices/assign', isAdmin,autoAssignChoices);

// Route pour affecter manuellement un sujet PFA à un étudiant
router.patch('/PFA/choices/:id/assign/student/:studentId',isAdmin, assignPFAtoStudent);


// Route pour supprimer les choix de tous les étudiants
router.post('/clearChoices', clearAllStudentChoices);

export default router;