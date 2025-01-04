import express from 'express';
import {
    createCV,
    createStudent,
    deleteStudent,
    getAllStudents,
    getStudentById,
    getStudentProfile,
    updateStudent,
    updateStudentProfile,
    createStudentFromFile,
    getCvMe,
    getCvByID,
    updateCV
} from '../controllers/StudentController.js';
import { toggleArchiveUser, updatePassword } from '../controllers/UserController.js';
import { isAdmin, isAdminOrTeacher, isStudent } from "../middlewares/authentication.js";
import multer from "multer"

const upload = multer({ dest: 'uploads/' });
const router = express.Router();



// Update own profile
router.patch('/me', isStudent, updateStudentProfile);

// get Own profile for student
router.get('/me', isStudent, getStudentProfile);

// create a new user from ewel file
router.post('/file', isAdmin,upload.single('file'), createStudentFromFile); 

// Create a new student
router.post('/', createStudent);

// Get all students
router.get('/', isAdminOrTeacher, getAllStudents);

// Get a student by ID
router.get('/:id', isAdmin, getStudentById);

// Update a student by ID
router.patch('/:id', isAdmin, updateStudent);


// patch update student password
router.patch('/:id/password', isAdmin, updatePassword("student"));

// Delete a student by ID
router.delete('/:id', isAdmin, deleteStudent);

// Archive a student
router.put('/:id', isAdmin, toggleArchiveUser("student")); 

// Route to creat Student CV
router.post('/CV/me', isStudent, createCV); 

// Route to get Student CV
router.get('/CV/me', isStudent, getCvMe); 

// get studiant/:id/CV - get student cv by his ID
router.get('/:id/CV', isAdminOrTeacher, getCvByID);

// patch studiant CV
router.get('/:id/CV', isStudent, updateCV);

export default router;
