import express from 'express';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    getStudentById,
    getStudentProfile,
    updateStudent,
    updateStudentProfile
} from '../controllers/StudentController.js';
import { toggleArchiveUser, updatePassword } from '../controllers/UserController.js';
import { isAdmin, isAdminOrTeacher, isStudent } from "../middlewares/authentication.js";


const router = express.Router();

// get Own profile for student
router.get('/me', isStudent, getStudentProfile);

// Create a new student
router.post('/', createStudent);

// Get all students
router.get('/', isAdminOrTeacher, getAllStudents);

// Get a student by ID
router.get('/:id', isAdmin, getStudentById);

// Update a student by ID
router.patch('/:id', isAdmin, updateStudent);

// Update own profile
router.put('/me', isStudent, updateStudentProfile);

// patch update student password
router.patch('/:id/password', isAdmin, updatePassword("student"));

// Delete a student by ID
router.delete('/:id', isAdmin, deleteStudent);

// Archive a teacher
router.put('/:id', isAdmin, toggleArchiveUser("student")); // Route to Archive user

export default router;
