import express from "express";
import { addDepositPeriod } from "../controllers/PFAController.js";
import { loggedMiddleware, isAdmin } from "../middlewares/authentification.js";

const router = express.Router();

router.patch("/PFA/OPEN", addDepositPeriod);

export default router;
