import express from 'express';

import {
    isAdmin
} from '../middlewares/authentication.js';
import { CreateOrUpdateDefensePFE, publishOrHideDefense, sendDefensePlanningEmail } from '../controllers/DefensePFE.js';

const router = express.Router();

// Route to create or update the defense for a specific student project (PFE).
router.post('/:id/soutenances', isAdmin, CreateOrUpdateDefensePFE);

// Route to update the defense for a specific student project (PFE).
router.patch('/:id/soutenances', isAdmin, CreateOrUpdateDefensePFE);

// Route to publish or hide a defense based on the given response ('publish' or 'hide').
router.post('/soutenances/publish/:response', isAdmin, publishOrHideDefense);

// Route to send defense planning emails to students, teachers, and jury members.
router.post('/soutenances/send', isAdmin, sendDefensePlanningEmail);

export default router;
