import express from "express";
import {
  addDepositPeriod,
  getAllDepositPeriods,
  updateDepositPeriod,
} from "../controllers/DepositPeriod.js";

const router = express.Router();

router.post("/open", addDepositPeriod);

router.get("/open", getAllDepositPeriods);

router.patch("/open", updateDepositPeriod);

export default router;
