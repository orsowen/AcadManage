import express from 'express';
import {
    createTeacher,
    deleteTeacher,
    getAllTeachers,
    getTeacherById,
    getTeacherProfile,
    updateTeacher, 
    updateTeacherPassword,
} from '../controllers/TeacherController.js';
import { isAdmin, isTeacher } from "../middlewares/authentication.js";

const router = express.Router();

// Create a new teacher
router.post('/', isAdmin, createTeacher);

// Get all teachers
router.get('/', isAdmin, getAllTeachers);

// Get a single teacher by ID
router.get('/:id', isAdmin, getTeacherById);

// ( get dont work thats why post)
router.post('/profile', isTeacher, getTeacherProfile);

// Update a teacher
router.patch('/:id', isAdmin, updateTeacher);

// patch update teacher password
router.patch('/:id/password', isAdmin, updateTeacherPassword);

// Delete a teacher
router.delete('/:id', isAdmin, deleteTeacher);

export default router;
