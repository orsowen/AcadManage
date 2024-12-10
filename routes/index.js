import express from "express";

import internshipRoutes from "./InternshipRoutes.js";
import planningStageRoutes from "./PlanningStageRoutes.js";
import studentRoutes from "./StudentRoutes.js";
import teacherRoutes from "./TeacherRoutes.js";
import UserConnexionRoutes from "./UserConnexionRoutes.js";
import PFE from "./PFE.js";

const router = express.Router();

// ROUTES --------------------------------

router.use("/internships/stage/planning", planningStageRoutes);
router.use("/internships/stage", internshipRoutes);
router.use("/users", UserConnexionRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
router.use("/PFE", PFE);

// Hot l route mta3ek lenna fi 3oudh fi App.js
// esstaamel router.use() mouch app.use() w kahaw mriguel


export default router;
