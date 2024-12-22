import express from "express";
import DepositPeriod from "./DepositPeriod.js";
import internshipRoutes from "./InternshipRoutes.js";
import PFE from "./PFE.js";
import planningStageRoutes from "./PlanningStageRoutes.js";
import skillRoutes from "./skill.js";
import studentRoutes from "./StudentRoutes.js";
import subjectRoutes from "./subject.js";
import teacherRoutes from "./TeacherRoutes.js";
import testNotificationsRouter from "./test_notif.js";
import UserConnexionRoutes from "./UserConnexionRoutes.js";
import routerPFA from "./PFA.js";
import choicePFA from "./Choice.js";
import soutenancesPFARoutes from "./routes/PlanningPFARoutes.js";

const router = express.Router();

// ROUTES --------------------------------
router.use(["/PFE", "/PFA", "/stage"], DepositPeriod);
router.use("/internships/stage/planning", planningStageRoutes);
router.use("/internships/stage", internshipRoutes);
router.use("/users", UserConnexionRoutes);
router.use("/teachers", teacherRoutes);
router.use("/students", studentRoutes);
router.use("/PFE", PFE);
router.use("/test-notifications", testNotificationsRouter);
router.use("/competences", skillRoutes);
router.use("/matieres", subjectRoutes);
router.use("/PFA", routerPFA);
router.use("/", choicePFA);
app.use("/PFA", soutenancesPFARoutes);
// Hot l route mta3ek lenna fi 3oudh fi App.js
// esstaamel router.use() mouch app.use() w kahaw mriguel : mriguel

export default router;
