import express from 'express';
import {
    createUser,
    deleteUser,
    getUserByCin,
    getUserById,
    loginUser,
    updateUser,
} from '../controllers/UserController.js'; // Import controller functions

const router = express.Router();

// User Routes
router.post('/register', createUser); // Route to create a new user
router.get('/:id', getUserById); // Route to get user by ID
router.get('/cin/:cin', getUserByCin); // Route to get user by Cin
router.patch('/:id', updateUser); // Route to update user details
router.delete('/:id', deleteUser); // Route to delete user
router.post('/login', loginUser); // Route to log in a user

export default router;
