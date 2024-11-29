import express from "express"
import {logIn} from "../controllers/UserControllers.js"

const router = express.Router()

router.post("/signin",logIn)

export default router