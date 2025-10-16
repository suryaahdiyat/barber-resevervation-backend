import express from "express";
import {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getAvailableBarbers,
} from "../controllers/reservationController.js";

const router = express.Router();

router.get("/", getAllReservations);
router.get("/:id", getReservationById);
router.post("/", createReservation);
router.put("/:id/status", updateReservationStatus);
router.delete("/:id", deleteReservation);
router.get("/check/available-barbers", getAvailableBarbers);

export default router;
