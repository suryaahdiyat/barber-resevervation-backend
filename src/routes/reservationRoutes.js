import express from "express";
import {
  getReservations,
  searchReservation,
  getReservationById,
  getReservationsByUserId,
  getReservationsByBarberId,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getAvailableBarbers,
} from "../controllers/reservationController.js";

const router = express.Router();

router.get("/", getReservations);
router.get("/search", searchReservation);
router.get("/user/:id", getReservationsByUserId);
router.get("/barber/:id", getReservationsByBarberId);
router.get("/:id", getReservationById);
router.post("/", createReservation);
router.put("/:id/status", updateReservationStatus);
router.delete("/:id", deleteReservation);
router.get("/check/available-barbers", getAvailableBarbers);

export default router;
