// routes/internship.routes.js

import express from 'express';
import { addInternship, getInternships } from '../controllers/internship.controller.js';

const router = express.Router();

// POST /internships - Add a new internship
router.post('/', addInternship);

// GET /internships - Get all internships
router.get('/', getInternships);

export default router;
