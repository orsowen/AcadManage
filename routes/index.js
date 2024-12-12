import express from "express";
import { notifyAboutDepositDeadline } from "../utils/LateNotifReminder.js";
import choicePFA from "./Choice.js";
import DepositPeriod from "./DepositPeriod.js";
import internshipRoutes from "./InternshipRoutes.js";
import routerPFA from "./PFA.js";
import PFE from "./PFE.js";
import planningStageRoutes from "./PlanningStageRoutes.js";
import skillRoutes from "./skill.js";
import studentRoutes from "./StudentRoutes.js";
import subjectRoutes from "./subject.js";
import teacherRoutes from "./TeacherRoutes.js";
import testNotificationsRouter from "./test_notif.js";
import UserConnexionRoutes from "./UserConnexionRoutes.js";

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
router.use("/PFAChoices", choicePFA);

// TEST MAIL NOTIFICATION
router.get("/test-notif-late-depot-satge", async (req, res) => {
    try {
        await notifyAboutDepositDeadline("STAGE", 1, true);
        res.status(200).json({ message: "Test notification executed successfully." });
    } catch (error) {
        console.error("Error during test notification:", error.message);
        res.status(500).json({ error: "Failed to execute test notification.", details: error.message });
    }
});
export default router;
