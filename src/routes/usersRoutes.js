// src/routes/userRoutes.js

import express from "express";
import {
  createUser,
  getAllUsers,
  updateUser,
  getUserById,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js"; // Import middleware

const router = express.Router();

// Rute POST untuk menambah user baru
// Rute ini harus dilindungi oleh JWT!
router.get("/", getAllUsers);
router.post("/", createUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);

// Tambahkan rute lain untuk manajemen user di sini (GET, PUT, DELETE)

export default router;
