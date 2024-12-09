import express from 'express';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    getStudentById,
    getStudentProfile,
    updateStudent, updateStudentPassword
} from '../controllers/StudentController.js';
import { isAdmin, isAdminOrTeacher, isStudent } from "../middlewares/authentication.js";

const router = express.Router();

// POST /students - Create a new student
router.post('/', isAdmin, createStudent);

// GET /students - Get all students
router.get('/', isAdminOrTeacher, getAllStudents);

// GET /students/:id - Get a student by ID
router.get('/:id', isAdmin, getStudentById);

// ( get dont work thats why post)
router.post('/profile', isStudent, getStudentProfile);

// PATCH /students/:id - Update a student by ID
router.patch('/:id', isAdmin, updateStudent);
// patch update student password
router.patch('/:id/password', isAdmin, updateStudentPassword);

// DELETE /students/:id - Delete a student by ID
router.delete('/:id', isAdmin, deleteStudent);

export default router;
