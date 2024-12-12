import express from 'express';
import {
    createStudent,
    deleteStudent,
    getAllStudents,
    getStudentById,
    getStudentProfile,
    updateStudent,
<<<<<<< HEAD
    updateStudentPassword,
    updateStudentProfile,
    createCV,
=======
    updateStudentProfile
>>>>>>> origin/main
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
<<<<<<< HEAD
// GET /students/:id - Get a student by ID
router.get('/:id', isAdmin, getStudentById);
// ( get dont work thats why post)
router.post('/profile', isStudent, getStudentProfile);
// PATCH /students/:id - Update a student by ID
router.patch('/:id', isAdmin, updateStudent);
// update own profile
router.put('/me', isStudent, updateStudentProfile);

// patch update student password
router.patch('/:id/password', isAdmin, updateStudentPassword);
// DELETE /students/:id - Delete a student by ID
=======

// Get a student by ID
router.get('/:id', isAdmin, getStudentById);

// Update a student by ID
router.patch('/:id', isAdmin, updateStudent);

// Update own profile
router.put('/me', isStudent, updateStudentProfile);

// patch update student password
router.patch('/:id/password', isAdmin, updatePassword("student"));

// Delete a student by ID
>>>>>>> origin/main
router.delete('/:id', isAdmin, deleteStudent);

// Archive a teacher
router.put('/:id', isAdmin, toggleArchiveUser("student")); 

// Route to Archive user
router.post('/CV/me', isStudent, createCV); 
// Route to Archive user
//router.get('/CV/me', isStudent, getCvMe); 
// get studiant/CV/me - get all professionel information of the studiant
//router.get('/CV', isStudent, getCvStudent); 
// get /cv - get student/cv - get all information of the student

export default router;
