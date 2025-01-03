import express from "express";
import { updateGraduationdByID, addNewAcademicYear, sendNotification } from "../controllers/seasonController.js";
import { isAdmin } from "../middlewares/authentication.js";


const router = express.Router();

router.patch('/student/:id', isAdmin, updateGraduationdByID);
router.post('/', isAdmin, addNewAcademicYear);
router.post('/notify', isAdmin, sendNotification);

export default router;