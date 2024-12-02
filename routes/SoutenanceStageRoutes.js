import express from 'express';
import {
    createSoutenanceStage,
    deleteSoutenanceStage,
    getAllSoutenanceStages,
    getSoutenanceStageById,
    updateSoutenanceStage
} from '../controllers/SoutenanceStageController.js';

const router = express.Router();

// POST /soutenance-stages - Create a new soutenance stage
router.post('/soutenance', createSoutenanceStage);

// GET /soutenance-stages - Fetch all soutenance stages
router.get('/soutenance', getAllSoutenanceStages);

// GET /soutenance-stages/:id - Fetch a soutenance stage by ID
router.get('/soutenance/:id', getSoutenanceStageById);

// PATCH /soutenance-stages/:id - Update a soutenance stage by ID
router.patch('/soutenance/:id', updateSoutenanceStage);

// DELETE /soutenance-stages/:id - Delete a soutenance stage by ID
router.delete('/soutenance/:id', deleteSoutenanceStage);

export default router;
