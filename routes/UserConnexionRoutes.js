import express from 'express';
import {
    // createUser,
    createAdmin,
    deleteUser,
    getUserByCin,
    getUserById,
    loginUser,
    toggleArchiveUser,
    updateUser,
} from '../controllers/UserController.js';
import { isAdmin } from "../middlewares/authentication.js";


const router = express.Router();

// User Routes
router.get('/:id', isAdmin, getUserById); // Route to get user by ID
router.get('/cin/:cin', isAdmin, getUserByCin); // Route to get user by Cin
// router.post('/register', isAdmin, createUser); // Route to create a new user
router.post('/register', isAdmin, createAdmin); // Route to create a new user
router.patch('/:id', isAdmin, updateUser); // Route to update user details
router.delete('/:id', isAdmin, deleteUser); // Route to delete user
router.post('/login', loginUser); // Route to log in a user
router.put('/:id', isAdmin, toggleArchiveUser("admin")); // Route to Archive user


export default router;
