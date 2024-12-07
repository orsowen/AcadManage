
import express from 'express';
import {
    addInternship,
    addTeacherToInternship,
    assignTeachersToInternships,
    deleteInternship,
    getAllInternships,
    getInternshipById,
    removeAllAssignedInternships,
    updateInternship,
} from '../controllers/InternshipController.js';

import {
    addDepositPeriod
} from "../controllers/DepositPeriod.js";

const router = express.Router();

// POST /internships - Add a new internship
router.post('/', addInternship);

// GET /internships - Get all internships
router.get('/', getAllInternships);

// GET /internships/:id - Get an internship by ID
router.get('/:id', getInternshipById);

// PATCH /internships/:id - Update an internship by ID
router.patch('/:id', updateInternship);

// DELETE /internships/:id - Delete an internship by ID
router.delete('/:id', deleteInternship);

router.post('/planning/assign', assignTeachersToInternships);
// 
router.post('/planning/update', addTeacherToInternship);
// FOR DEVELOPMENT USE ONLY
router.post('/planning/remove-all-assigned', removeAllAssignedInternships);
// 
router.post("/open", addDepositPeriod);

export default router;
