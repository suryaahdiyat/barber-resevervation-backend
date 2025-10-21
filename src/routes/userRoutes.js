// routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  getAllUsersCA,
  getAllBarbers,
  getAllCustomers,
  getUserById,
  searchUser,
  createUser,
  updateUser,
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
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Rute login
router.post("/login", loginUser);

export default router;
