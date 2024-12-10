import express from 'express';
import {
    createPFE,
    updatePFE,
    ListAllPFEInfo,
    choosePFE,
    validateAssignments,
    assignPFEToTeacher,
    publishOrHidePFE,
    sendPlanningEmail
} from '../controllers/PFE.js';

import {
    isAdmin,
    isAdminOrTeacher,
    isStudent,
    isTeacher
} from '../middlewares/authentication.js';

const router = express.Router();

// Route for students to create a new PFE (Project)
router.post('/post', isStudent, createPFE);

// Route for students to update their PFE
router.patch('/:id', isStudent, updatePFE);

// Route for admins or teachers to list all PFE information
router.get('/', isAdminOrTeacher, ListAllPFEInfo);

// Route for teachers to choose or approve a PFE
router.patch('/:id/choice', isTeacher, choosePFE);

// Route for admins to validate PFE assignments
router.patch('/planning/assign', isAdmin, validateAssignments);

// Route for admins to assign a PFE to a specific teacher
router.patch('/:id/planning/assign', isAdmin, assignPFEToTeacher);

// Route for admins to publish or hide PFE information
// The ':response' parameter can be used to determine the action (publish/hide)
router.post('/planning/publish/:response', isAdmin, publishOrHidePFE);

// Route for admins to send planning emails (e.g., schedules, notifications)
router.post('/planning/send', isAdmin, sendPlanningEmail);

export default router;
