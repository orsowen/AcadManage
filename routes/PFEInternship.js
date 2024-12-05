
import express from 'express';
import { createPFE, updatePFE } from '../controllers/PFE.js';


const router = express.Router();

router.post('/post', createPFE);

router.patch('/:id', updatePFE);

export default router;