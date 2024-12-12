import express from "express";
import {

    // createUser,
    createAdmin,
    deleteUser,
    getUserByCin,
    getUserById,
    loginUser,
    toggleArchiveUser,
    updatePassword,
    updateUser,
} from '../controllers/UserController.js';
import { isAdmin } from "../middlewares/authentication.js";


const router = express.Router();


// get user by ID
router.get('/:id', isAdmin, getUserById);

// get user by Cin
router.get('/cin/:cin', isAdmin, getUserByCin);

// create a new user
// router.post('/register', isAdmin, createUser); 

// create a new ADmin
router.post('/register', isAdmin, createAdmin);

// Update user details
router.patch('/:id', isAdmin, updateUser);

// Delete user
router.delete('/:id', isAdmin, deleteUser);

// Log in a user
router.post('/login', loginUser);

// Archive/UnArchive user
router.put('/:id', isAdmin, toggleArchiveUser("admin"));

// Update password for admin
router.patch('/:id/password', isAdmin, updatePassword("admin"));


export default router;
