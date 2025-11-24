import { createUploader } from "../middleware/upload.js";
import express from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentByReservationId,
  updatePaymentByBoth,
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
router.put("/:id/status-proof", upload.single("proof"), updatePaymentByBoth);
router.patch("/:id/status", updatePaymentStatus);
router.patch("/:id/proof", updatePaymentProof);
router.delete("/:id/", deletePayment);

export default router;
