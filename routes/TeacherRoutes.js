import express from 'express';
import {
    createTeacher,
    deleteTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
} from '../controllers/TeacherController.js';

const router = express.Router();

// Create a new teacher
router.post('/', createTeacher);

// Get all teachers
router.get('/', getAllTeachers);

// Get a single teacher by ID
router.get('/:id', getTeacherById);

// Update a teacher
router.patch('/:id', updateTeacher);

// Delete a teacher
router.delete('/:id', deleteTeacher);

export default router;
