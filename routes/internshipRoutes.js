
import express from 'express';
import {
    addInternship,
    addTeacherToInternship,
    assignTeachersToInternships,
    deleteInternship,
    getAllInternships,
    getAssignedInternships,
    getInternshipById,
    getInternshipByStudent,
    removeAllAssignedInternships,
    updateInternship,
    validateInternship,
} from '../controllers/InternshipController.js';

import {
    addDepositPeriod
} from "../controllers/DepositPeriod.js";
import { isAdmin, isStillStudent, isStudent, isTeacher } from "../middlewares/authentication.js";

const router = express.Router();

// get own Internship 
router.get('/me', isStudent, isStillStudent, getInternshipByStudent);

// POST /internships - Add a new internship
router.post('/', isStudent, isStillStudent, addInternship);

// GET /internships - Get all internships
router.get('/', isAdmin, getAllInternships);

// GET /internships/:id - Get an internship by ID
router.get('/:id', isTeacher, getInternshipById);


// PATCH /internships/:id - Update an internship by ID
// router.patch('/:id', isStudent, isStillStudent, updateInternship);
router.patch('/:id', isAdmin, updateInternship);

// DELETE /internships/:id - Delete an internship by ID
router.delete('/:id', isAdmin, deleteInternship);

// automatic assignment of teachers to internships
router.post('/planning/assign', isAdmin, assignTeachersToInternships);

// manual add teacher to internship
router.post('/planning/update', isAdmin, addTeacherToInternship);

// FOR DEVELOPMENT USE ONLY
router.post('/planning/remove-all-assigned', isAdmin, removeAllAssignedInternships);

// open period depot 
router.post("/open", isAdmin, addDepositPeriod);

// get assigned internships for the logged in teacher
router.post('/assigned-to-me', isTeacher, getAssignedInternships);

// valider stage (teacher)
router.put('/:id', isTeacher, validateInternship);

// 

export default router;
