
import express from 'express';
import { createPFE, updatePFE, ListAllPFEInfo, choosePFE, validateAssignments, assignPFEToTeacher, publishOrHidePFE, sendPlanningEmails } from '../controllers/PFE.js';


const router = express.Router();


router.post('/post', createPFE);

router.patch('/:id', updatePFE);


router.get('/', ListAllPFEInfo);

router.get('/:id/choice', choosePFE);


router.get('/planning/assign', validateAssignments);

router.get('/:id/planning/assign', assignPFEToTeacher);

router.get('/planning/publish/:response', publishOrHidePFE);

router.get('/PFE/planning/send', sendPlanningEmails);


export default router;