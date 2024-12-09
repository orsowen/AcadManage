import express from 'express';
import {
    createTeacher,
    deleteTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
} from '../controllers/TeacherController.js';
import { isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

// Create a new teacher
router.post('/', isAdmin, createTeacher);

// Get all teachers
router.get('/', isAdmin, getAllTeachers);

// Get a single teacher by ID
router.get('/:id', isAdmin, getTeacherById);

// Update a teacher
router.patch('/:id', isAdmin, updateTeacher);

// Delete a teacher
router.delete('/:id', isAdmin, deleteTeacher);

export default router;
