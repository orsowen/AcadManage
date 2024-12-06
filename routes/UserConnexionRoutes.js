import express from "express"
import { logIn } from "../controllers/UserController.js"
import { isAdmin } from "../middlewares/authentification.js"
import { AddUser, delUser, fetchUser, fetchUserBylogin, patchUser } from "../controllers/UserController.js"

const router = express.Router()

router.post("/signin", logIn)
router.get("/:login",fetchUserBylogin)
router.get("/",fetchUser)
router.post("/",AddUser)
router.delete("/:login",delUser)
router.patch("/:login",patchUser)

export default router