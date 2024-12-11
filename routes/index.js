import express from "express";

import internshipRoutes from "./InternshipRoutes.js";
import planningStageRoutes from "./PlanningStageRoutes.js";
import studentRoutes from "./StudentRoutes.js";
import teacherRoutes from "./TeacherRoutes.js";
import UserConnexionRoutes from "./UserConnexionRoutes.js";
import PFE from "./PFE.js";
import skillRoutes from "./skill.js";
import subjectRoutes from "./subject.js";
import testNotificationsRouter from './test_notif.js';

const router = express.Router();

// ROUTES --------------------------------

router.use("/internships/stage/planning", planningStageRoutes);
router.use("/internships/stage", internshipRoutes);
router.use("/users", UserConnexionRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
router.use("/PFE", PFE);
router.use('/test-notifications', testNotificationsRouter);
router.use("/competences", skillRoutes);
router.use("/matieres", subjectRoutes);
// Hot l route mta3ek lenna fi 3oudh fi App.js
// esstaamel router.use() mouch app.use() w kahaw mriguel : mriguel


export default router;
