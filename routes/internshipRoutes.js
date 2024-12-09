
import express from 'express';
import {
    addInternship,
    addTeacherToInternship,
    assignTeachersToInternships,
    deleteInternship,
    getAllInternships,
    getAssignedInternships,
    getInternshipById,
    removeAllAssignedInternships,
    updateInternship, validateInternship,
} from '../controllers/InternshipController.js';

import {
    addDepositPeriod
} from "../controllers/DepositPeriod.js";
import { isAdmin, isStillStudent, isStudent, isTeacher } from "../middlewares/authentification.js";

const router = express.Router();

// POST /internships - Add a new internship
router.post('/', isStudent, isStillStudent, addInternship);

// GET /internships - Get all internships
router.get('/', isAdmin, getAllInternships);

// GET /internships/:id - Get an internship by ID
router.get('/:id', isTeacher, getInternshipById);

// PATCH /internships/:id - Update an internship by ID
router.patch('/:id', isStudent, isStillStudent, updateInternship);

// DELETE /internships/:id - Delete an internship by ID
router.delete('/:id', isAdmin, deleteInternship);

router.post('/planning/assign', isAdmin, assignTeachersToInternships);
// 
router.post('/planning/update', isAdmin, addTeacherToInternship);
// FOR DEVELOPMENT USE ONLY
router.post('/planning/remove-all-assigned', isAdmin, removeAllAssignedInternships);
// 
router.post("/open", isAdmin, addDepositPeriod);

// Assuming you have a JWT middleware that decodes the token
router.post('/assigned-to-me', isTeacher, getAssignedInternships);

// valider stage (teacher)
router.put('/:id', isTeacher, validateInternship);


export default router;
