// src/routes/customersRoutes.js
import express from "express";
import {
  getAllServices,
  createService,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", getAllServices);
router.post("/", createService);
router.get("/:id", getServiceById);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
