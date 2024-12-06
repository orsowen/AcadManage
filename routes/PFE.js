
import express from 'express';
import { createPFE, updatePFE, ListAllPFEInfo, choosePFE } from '../controllers/PFE.js';


const router = express.Router();

router.get('/', ListAllPFEInfo);

router.get('/:id/choice', choosePFE);

router.post('/post', createPFE);

router.patch('/:id', updatePFE);

export default router;