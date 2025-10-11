// src/routes/customersRoutes.js
import express from "express";
import {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", getAllCustomers);
router.post("/", createCustomer);
router.get("/:id", protect, getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
