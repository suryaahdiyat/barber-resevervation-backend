// src/routes/authRoutes.js

import express from "express";
import { loginUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

// POST: Rute untuk mendapatkan JWT
router.post("/login", loginUser);

// POST: Rute konfirmasi untuk logout
router.post("/logout", logoutUser);

export default router;
