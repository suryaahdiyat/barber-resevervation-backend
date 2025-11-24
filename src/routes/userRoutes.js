// routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  getAllUsersCA,
  getAllBarbers,
  getAllCustomers,
  getUserById,
  searchUser,
  getBarbersWithPresence,
  updateBarberPresence,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
  loginUser,
} from "../controllers/userController.js";

const router = express.Router();

// Rute CRUD dasar
router.get("/", getAllUsers);
router.get("/ca", getAllUsersCA);
router.get("/barbers", getAllBarbers);
router.get("/customers", getAllCustomers);
router.get("/search", searchUser);
router.get("/barbers/presence", getBarbersWithPresence);
router.patch("/barbers/:id/presence", updateBarberPresence);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/password", updatePassword);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Rute login
router.post("/login", loginUser);

export default router;
