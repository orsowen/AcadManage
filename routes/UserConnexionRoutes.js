import express from "express"
import { logIn } from "../controllers/UserController.js"
import { isAdmin } from "../middlewares/authentification.js"
import { AddUser, delUser, fetchUser, fetchUserBylogin, patchUser } from "../controllers/UserController.js"

const router = express.Router()

router.post("/signin", logIn)
router.get("/:login",isAdmin,fetchUserBylogin)
router.get("/:login",isAdmin,fetchUser)
router.post("/",isAdmin,AddUser)
router.delete("/:login",isAdmin,delUser)
router.patch("/:login",isAdmin,patchUser)

export default router