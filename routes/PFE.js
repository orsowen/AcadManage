
import express from 'express';
import { createPFE, updatePFE, ListAllPFEInfo, choosePFE, validateAssignments, assignPFEToTeacher, publishOrHidePFE, sendPlanningEmail } from '../controllers/PFE.js';
import { isAdmin, isAdminOrTeacher, isStudent, isTeacher } from '../middlewares/authentication.js';


const router = express.Router();


router.post('/post', isStudent, createPFE);

router.patch('/:id', isStudent, updatePFE);


router.get('/', isAdminOrTeacher, ListAllPFEInfo);

router.patch('/:id/choice', isTeacher, choosePFE);


router.patch('/planning/assign', isAdmin, validateAssignments);

router.patch('/:id/planning/assign', isAdmin, assignPFEToTeacher);

router.post('/planning/publish/:response', isAdmin, publishOrHidePFE);

router.post('/planning/send', isAdmin, sendPlanningEmail);


export default router;