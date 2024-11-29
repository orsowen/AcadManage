import express from "express"
import {logIn} from "../controller/Utilisateurcontroller.js"

const router = express.Router()

router.post("/signin",logIn)


export default router