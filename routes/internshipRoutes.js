
import express from 'express';
import {
    addInternship,
    deleteInternship,
    getAllInternships,
    getInternshipById,
    updateInternship,
} from '../controllers/InternshipController.js';

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

export default router;
