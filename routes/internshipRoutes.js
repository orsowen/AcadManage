
import express from 'express';
import { addInternship, getInternships } from '../controllers/InternshipController.js';

const router = express.Router();

// POST /internships - Add a new internship
router.post('/internships', addInternship);

// GET /internships - Get all internships
router.get('/internships', getInternships);

export default router;
