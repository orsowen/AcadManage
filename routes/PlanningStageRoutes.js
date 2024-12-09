import express from 'express';
import {
    createPlanningStage,
    deletePlanningStage,
    getAllPlanningStages,
    getPlanningStageById,
    getPlanningStageByStudent,
    updatePlanningStage,
    updatePublicationStatus,
} from '../controllers/PlanningStageController.js';
import { isAdmin, isStillStudent, isStudent, isTeacher } from "../middlewares/authentification.js";

const router = express.Router();

// POST /planning-stages - Create a new planning stage
router.post('/planning', isAdmin, createPlanningStage);

// GET /planning-stages - Fetch all planning stages
router.get('/planning', isAdmin, getAllPlanningStages);

// get planning for logged in Student
router.get('/planning/me', isStillStudent, isStudent, getPlanningStageByStudent);

// GET /planning-stages/:id - Fetch a planning stage by ID
router.get('/planning/:id', getPlanningStageById);

// PATCH /planning-stages/:id - Update a planning stage by ID
router.patch('/planning/:id', isTeacher, updatePlanningStage);

// DELETE /planning-stages/:id - Delete a planning stage by ID
router.delete('/planning/:id', isAdmin, deletePlanningStage);

// Route to update publication status for planning stages
router.post('/planning/publish/:response', isAdmin, updatePublicationStatus);

export default router;
