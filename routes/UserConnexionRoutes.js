// import express from "express"
// import { logIn } from "../controllers/UserController.js"

// import { isAdmin } from "../middlewares/authentification.js"
// import { AddUser, delUser, fetchUser, fetchUserBylogin, patchUser } from "../controllers/UserController.js"


// const router = express.Router()

// router.post("/signin", logIn)

// router.get("/:login",isAdmin,fetchUserBylogin)
// router.get("/:login",isAdmin,fetchUser)
// router.post("/",isAdmin,AddUser)
// router.delete("/:login",isAdmin,delUser)
// router.patch("/:login",isAdmin,patchUser)

// export default router
import express from 'express';
import {
    createUser,
    deleteUser,
    getUserByCin,
    getUserById,
    loginUser,
    updateUser,
} from '../controllers/userController.js'; // Import controller functions

const router = express.Router();

// User Routes
router.post('/register', createUser); // Route to create a new user
router.get('/user/:id', getUserById); // Route to get user by ID
router.get('/user/cin/:cin', getUserByCin); // Route to get user by Cin
router.put('/user/:id', updateUser); // Route to update user details
router.delete('/user/:id', deleteUser); // Route to delete user
router.post('/login', loginUser); // Route to log in a user

export default router;
