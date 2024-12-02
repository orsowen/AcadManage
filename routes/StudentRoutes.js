import express from 'express';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    getStudentById,
    updateStudent
} from '../controllers/StudentController.js';

const router = express.Router();

// POST /students - Create a new student
router.post('/', createStudent);

// GET /students - Get all students
router.get('/', getAllStudents);

// GET /students/:id - Get a student by ID
router.get('/:id', getStudentById);

// PATCH /students/:id - Update a student by ID
router.patch('/:id', updateStudent);

// DELETE /students/:id - Delete a student by ID
router.delete('/:id', deleteStudent);

export default router;
