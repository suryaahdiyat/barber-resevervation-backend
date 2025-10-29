import { createUploader } from "../middleware/upload.js";
import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentByReservationId,
  updatePaymentByAdmin,
  updatePaymentStatus,
  updatePaymentProof,
  deletePayment,
} from "../controllers/paymentController.js";

const router = express.Router();
const upload = createUploader("payments");

router.post("/", createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.get("/by-reservation/:id", getPaymentByReservationId);
router.put("/:id/by-admin", upload.single("proof"), updatePaymentByAdmin);
router.patch("/:id/status", updatePaymentStatus);
router.patch("/:id/proof", updatePaymentProof);
router.delete("/:id/", deletePayment);

export default router;
