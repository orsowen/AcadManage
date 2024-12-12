
import express from 'express';
import { addDepositPeriod } from "../controllers/DepositPeriod.js";
import {
    addInternship,
    addTeacherToInternship,
    assignTeachersToInternships,
    deleteInternship,
    getAllInternships,
    getAssignedInternships,
    getInternshipById,
    getInternshipByStudentForPV,
    getInternshipByStudentToken,
    removeAllAssignedInternships,
    updateInternship,
    validateInternship
} from '../controllers/internshipController.js';
import {
    isAdmin,
    isStillStudent,
    isStudent,
    isStudentOrAdmin,
    isTeacher,
} from "../middlewares/authentication.js";
import { isDepotOpen } from '../middlewares/depositPeriodMiddleware.js';

const router = express.Router();

// get assigned internships for the logged in teacher
router.get('/assigned-to-me', isTeacher, getAssignedInternships);

// get own Internship 
router.get('/me', isStudent, isStillStudent, getInternshipByStudentToken);

// consult PV
router.get('/pv', isStudent, getInternshipByStudentForPV);

// Add a new internship
router.post('/', isStudent, isStillStudent, isDepotOpen("STAGE", "create"), addInternship);

// Get all internships
router.get('/', isAdmin, getAllInternships);

// Get an internship by ID
router.get('/:id', isTeacher, getInternshipById);

// Update an internship by ID
router.patch('/:id', isStudentOrAdmin, isDepotOpen("STAGE", "update"), updateInternship(false));

// Update an internship documents by ID
router.patch('/:id/documents', isStudent, isStillStudent, isDepotOpen("STAGE", "update"), updateInternship(true));

// Delete an internship by ID
router.delete('/:id', isAdmin, deleteInternship);

// Automatic assignment of teachers to internships
router.post('/planning/assign', isAdmin, assignTeachersToInternships);

// manual add teacher to internship
router.post('/planning/update', isAdmin, addTeacherToInternship);

// FOR DEVELOPMENT USE ONLY
router.post('/planning/remove-all-assigned', isAdmin, removeAllAssignedInternships);

// open period depot 
router.post("/open", isAdmin, addDepositPeriod(false));

// valider stage (teacher)
router.put('/:id', isTeacher, validateInternship);


export default router;
