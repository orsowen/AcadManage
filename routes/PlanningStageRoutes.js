import express from 'express';
import {
    createPlanningStage,
    deletePlanningStage,
    getAllPlanningStages,
    getPlanningStageById,
    updatePlanningStage,
    updatePublicationStatus,
} from '../controllers/PlanningStageController.js';

const router = express.Router();

// POST /planning-stages - Create a new planning stage
router.post('/planning', createPlanningStage);

// GET /planning-stages - Fetch all planning stages
router.get('/planning', getAllPlanningStages);

// GET /planning-stages/:id - Fetch a planning stage by ID
router.get('/planning/:id', getPlanningStageById);

// PATCH /planning-stages/:id - Update a planning stage by ID
router.patch('/planning/:id', updatePlanningStage);

// DELETE /planning-stages/:id - Delete a planning stage by ID
router.delete('/planning/:id', deletePlanningStage);

// Route to update publication status for planning stages
router.post('/planning/publish/:response', updatePublicationStatus);

export default router;
