import express from "express";
import { manualTriggerBarberCheck } from "../utils/dailyBarberCheck.js";
import { manualResetBarberAttendance } from "../utils/resetBarberAttendance.js";

const router = express.Router();

// Manual trigger route untuk testing/admin
router.get("/trigger-barber-check", manualTriggerBarberCheck);
router.get("/trigger-attendance-reset", manualResetBarberAttendance);

export default router;
