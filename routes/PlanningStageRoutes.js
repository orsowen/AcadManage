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


// GET /planning-stages - Fetch all planning stages
router.get('/', isAdmin, getAllPlanningStages);

// get planning for logged in Student
router.get('/me', isStillStudent, isStudent, getPlanningStageByStudent);

// GET /planning-stages/:id - Fetch a planning stage by ID
router.get('/:id', getPlanningStageById);

// POST /planning-stages - Create a new planning stage
router.post('/', isAdminOrTeacher, createPlanningStage);

// SEND EMAIL
router.post('/send', isAdmin, sendMailPlanning);

// PATCH /planning-stages/:id - Update a planning stage by ID
router.patch('/:id', isTeacher, updatePlanningStage);

// DELETE /planning-stages/:id - Delete a planning stage by ID
router.delete('/:id', isAdmin, deletePlanningStage);

// Route to update publication status for planning stages
router.post('/publish/:response', isAdmin, updatePublicationStatus);

export default router;
