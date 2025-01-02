import express from 'express';

import {
    isAdmin
} from '../middlewares/authentication.js';
import { CreateOrUpdateDefensePFE, publishOrHideDefense } from '../controllers/DefensePFE.js';

const router = express.Router();

router.post('/PFE/:id/soutenances', isAdmin, CreateOrUpdateDefensePFE);

router.post('/PFE/soutenances/publish/:response', isAdmin, publishOrHideDefense);



export default router;
