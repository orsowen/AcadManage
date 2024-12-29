import express from 'express';
import {
    createPlanningStage,
    deletePlanningStage,
    getAllPlanningStages,
    getPlanningStageById,
    getPlanningStageByStudent,
    sendMailPlanning,
    updatePlanningStage,
    updatePublicationStatus,
} from '../controllers/PlanningStageController.js';
import { isAdmin, isAdminOrTeacher, isStillStudent, isStudent, isTeacher } from "../middlewares/authentication.js";

const router = express.Router();


// Fetch all planning stages
router.get('/', isAdmin, getAllPlanningStages);

// get planning for logged in Student
router.get('/me', isStillStudent, isStudent, getPlanningStageByStudent);

// Fetch a planning stage by ID
router.get('/:id', getPlanningStageById);

// Create a new planning stage
router.post('/', isTeacher, createPlanningStage);

// SEND EMAIL
router.post('/send', isAdmin, sendMailPlanning);

// Update a planning stage by ID
router.patch('/:id', isAdminOrTeacher, updatePlanningStage);

// Delete a planning stage by ID
router.delete('/:id', isAdmin, deletePlanningStage);

// Route to update publication status for planning stages
router.post('/publish/:response', isAdmin, updatePublicationStatus);

export default router;
