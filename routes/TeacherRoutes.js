<<<<<<< HEAD
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import dbConnection from "./dbConfig/dbConnection.js";
import router from './routes/index.js';
import routerPFA from "./routes/PFARoutes.js";
=======
import express from 'express';
import {
    createTeacher,
    deleteTeacher,
    getAllTeachers,
    getTeacherById,
    getTeacherProfile,
    updateTeacher,
    updateTeacherByToken
} from '../controllers/TeacherController.js';
import { toggleArchiveUser, updatePassword } from '../controllers/UserController.js';
import { isAdmin, isTeacher } from "../middlewares/authentication.js";
>>>>>>> origin/main

// ENVIRONMENT variables configuration
dotenv.config();

// MongoDB Connection
dbConnection();

<<<<<<< HEAD
const app = express();
const PORT = process.env.PORT || 8800;
=======
// get Own Profile 
router.get('/me', isTeacher, getTeacherProfile);
>>>>>>> origin/main

// Middleware
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/", routerPFA);
app.use(router); // Place router in index.js fi 3oudh lenna for better organization

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

<<<<<<< HEAD
export default app;
=======
// Update a teacher
router.patch('/:id', isAdmin, updateTeacher);

// update teacher based on token
router.put('/me', isTeacher, updateTeacherByToken);

// patch update teacher password
router.patch('/:id/password', isAdmin, updatePassword("teacher"));

// Delete a teacher
router.delete('/:id', isAdmin, deleteTeacher);

// Archive a teacher
router.put('/:id', isAdmin, toggleArchiveUser("teacher")); // Route to Archive user

export default router;
>>>>>>> origin/main
