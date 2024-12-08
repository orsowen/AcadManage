
import express from 'express';
import { createPFE, updatePFE, ListAllPFEInfo, choosePFE, validateAssignments } from '../controllers/PFE.js';


const router = express.Router();


router.post('/post', createPFE);

router.patch('/:id', updatePFE);


router.get('/', ListAllPFEInfo);

router.get('/:id/choice', choosePFE);


router.get('/planning/assign', validateAssignments);

router.get('/:id/planning/assign');

export default router;