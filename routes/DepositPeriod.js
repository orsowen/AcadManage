import express from "express";
import {
  addDepositPeriod,
  getDepositPeriods,
  updateDepositPeriod,
} from "../controllers/DepositPeriod.js";
import { isAdmin } from "../middlewares/authentication.js";

const router = express.Router();

router.post("/open", isAdmin, addDepositPeriod(true));

router.get("/open", isAdmin, getDepositPeriods);

router.patch("/open", isAdmin, updateDepositPeriod);

export default router;
