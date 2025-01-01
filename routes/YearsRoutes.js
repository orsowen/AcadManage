import express from "express";
import { updateGraduationdByID, addAcademicYearToAllStudents, sendNotification } from "../controllers/Years.js";
import { isAdmin } from "../middlewares/authentication.js";


const router = express.Router();

router.patch('/student/:id', isAdmin, updateGraduationdByID);
router.post('/', isAdmin, addAcademicYearToAllStudents);
router.post('/notify', isAdmin, sendNotification);

export default router;