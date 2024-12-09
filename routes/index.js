import express from "express";

import internshipRoutes from "./InternshipRoutes.js";
import planningStageRoutes from "./PlanningStageRoutes.js";
import studentRoutes from "./StudentRoutes.js";
import teacherRoutes from "./teacherRoutes.js";
import UserConnexionRoutes from "./UserConnexionRoutes.js";

const router = express.Router();
// const path = "/api-v1/";


// router.use(`${path}internships`, InternshipRoutes);
router.use("/internships/stage/planning", planningStageRoutes);
router.use("/internships/stage", internshipRoutes);
router.use("/users", UserConnexionRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
// Example of applying error handling middleware globally zid mbaaed

export default router;
