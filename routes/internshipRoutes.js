
import express from 'express';
import {
    addInternship,
    deleteInternship,
    getAllInternships,
    getInternshipById,
    updateInternship,
} from '../controllers/InternshipController.js';
import {
    addTeacherToTopic,
    assignTeachersToTopics,
    removeAllAssignedTopics
} from '../controllers/TopicController.js';


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

router.post('/planning/assign', assignTeachersToTopics);
// 
router.post('/planning/update', addTeacherToTopic);
// FOR DEVELOPMENT USE ONLY
router.post('/planning/remove-all-assigned', removeAllAssignedTopics);

export default router;
