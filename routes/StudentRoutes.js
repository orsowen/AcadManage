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

// POST /students - Create a new student
router.post('/', createStudent);

// GET /students - Get all students
router.get('/', isAdminOrTeacher, getAllStudents);

// GET /students/:id - Get a student by ID
router.get('/:id', isAdmin, getStudentById);

// PATCH / students /: id - Update a student by ID
router.patch('/:id', isAdmin, updateStudent);

// update own profile
router.put('/me', isStudent, updateStudentProfile);

// patch update student password
router.patch('/:id/password', isAdmin, updatePassword("student"));

// DELETE /students/:id - Delete a student by ID
router.delete('/:id', isAdmin, deleteStudent);

// Archive a teacher
router.put('/:id', isAdmin, toggleArchiveUser("student")); // Route to Archive user

export default router;
