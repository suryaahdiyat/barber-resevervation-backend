// src/routes/customersRoutes.js
import express from "express";
import {
  getAllBarbers,
  getAllAvailableBarbers,
  createBarber,
  getBarberById,
  updateBarber,
  deleteBarber,
} from "../controllers/barberController.js";

const router = express.Router();

router.get("/", getAllBarbers);
router.get("/available", getAllAvailableBarbers);
router.post("/", createBarber);
router.get("/:id", getBarberById);
router.put("/:id", updateBarber);
router.delete("/:id", deleteBarber);

export default router;
