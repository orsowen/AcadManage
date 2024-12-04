
import express from 'express';
import { createPFEWithInternship, updatepfeInternship } from '../controllers/PFEInternship.js';


const router = express.Router();

router.post('/post', createPFEWithInternship);

router.patch('/:id', updatepfeInternship);

export default router;