import express from 'express';
import {
    createPFE,
    updatePFE,
    ListAllPFEInfo,
    choosePFE,
    validateAssignments,
    assignPFEToTeacher,
    publishOrHidePFE,
    sendPlanningEmail,
    getTeacherDefenses,
    getStudentPFE
} from '../controllers/PFE.js';

import {
    isAdmin,
    isAdminOrTeacher,
    isStudent,
    isStudent3rdYear,
    isTeacher
} from '../middlewares/authentication.js';
import { isDepotOpen } from '../middlewares/depositPeriodMiddleware.js';

const router = express.Router();

// Route for students to create a new PFE (Project)
let message = "PFE can only be added only during the deposit period."
router.post('/post', isStudent3rdYear, isStudent, isDepotOpen("PFE", message), createPFE);

// Route for students to update their PFE
message = "PFE can only be modified only during the deposit period."
router.patch('/:id', isStudent3rdYear, isStudent, isDepotOpen("PFE", message), updatePFE);

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

router.get("/me", isTeacher, getTeacherDefenses)

router.get('/student/me', isStudent, isStudent3rdYear, getStudentPFE);

export default router;
