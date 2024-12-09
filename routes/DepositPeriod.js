import express from "express";
import {
  addDepositPeriod,
  getDepositPeriods,
  updateDepositPeriod,
} from "../controllers/DepositPeriod.js";
import { isAdmin, loggedMiddleware } from "../middlewares/authentification.js";

const router = express.Router();

router.post("/open",loggedMiddleware,isAdmin, addDepositPeriod);

router.get("/open",loggedMiddleware,isAdmin,  getDepositPeriods);

router.patch("/open", loggedMiddleware,isAdmin, updateDepositPeriod);

export default router;
