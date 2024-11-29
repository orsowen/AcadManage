import express from "express";
import {
  addPeriod,
  getPeriod,
  updatePeriod,
} from "../controllers/DepositPeriod.js";

const router = express.Router();

router.post("/open", addPeriod);

router.get("/open", getPeriod);

router.patch("/open", updatePeriod);

export default router;
