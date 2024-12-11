import express from 'express';
import {
    createTeacher,
    deleteTeacher,
    getAllTeachers,
    getTeacherById,
    getTeacherProfile,
    updateTeacher,
    updateTeacherByToken,
    updateTeacherPassword,
} from '../controllers/TeacherController.js';
import { toggleArchiveUser } from '../controllers/UserController.js';
import { isAdmin, isTeacher } from "../middlewares/authentication.js";


const router = express.Router();

// ( get dont work thats why post)
router.get('/profile', isTeacher, getTeacherProfile);

// Get all teachers
router.get('/', isAdmin, getAllTeachers);

// Get a single teacher by ID
router.get('/:id', isAdmin, getTeacherById);

// Create a new teacher
router.post('/', isAdmin, createTeacher);

// Update a teacher
router.patch('/:id', isAdmin, updateTeacher);

// update teacher based on token
router.put('/me', isTeacher, updateTeacherByToken);

// patch update teacher password
router.patch('/:id/password', isAdmin, updateTeacherPassword);

// Delete a teacher
router.delete('/:id', isAdmin, deleteTeacher);

// Archive a teacher
router.put('/:id', isAdmin, toggleArchiveUser("teacher")); // Route to Archive user

export default router;
