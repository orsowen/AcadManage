import express from "express";
import { addDepositPeriod } from "../controllers/DepositPeriod.js";

const router = express.Router();

router.post("/open", addDepositPeriod);

// router.get("/open", getPeriod);

// router.patch("/open", updatePeriod);

export default router;
