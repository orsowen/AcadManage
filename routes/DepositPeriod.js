import express from "express";
import {
  addDepositPeriod,
  getDepositPeriods,
  updateDepositPeriod,
} from "../controllers/DepositPeriod.js";

const router = express.Router();

router.post("/open", addDepositPeriod);

router.get("/open", getDepositPeriods);

router.patch("/open", updateDepositPeriod);

export default router;
