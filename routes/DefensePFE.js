import express from 'express';

import {
    isAdmin
} from '../middlewares/authentication.js';
import { CreateOrUpdateDefensePFE, publishOrHideDefense, sendDefensePlanningEmail } from '../controllers/DefensePFE.js';

const router = express.Router();

router.post('/:id/soutenances', isAdmin, CreateOrUpdateDefensePFE);

router.post('/soutenances/publish/:response', isAdmin, publishOrHideDefense);

router.post('/soutenances/send', isAdmin, sendDefensePlanningEmail);


export default router;
