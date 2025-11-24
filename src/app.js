import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "../config/db.js";
import userRoutes from "./routes/userRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import reservationRoute from "./routes/reservationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API Barber Reservation aktif 🚀");
});
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reservations", reservationRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

//agar uploads bisa diakses secara public
app.use("/uploads", express.static("uploads"));

// app.use(require("method-override")("_method"));

// tes koneksi database
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Koneksi ke database berhasil!");
  } catch (error) {
    console.error("❌ Gagal konek DB:", error);
  }
})();

app.use((req, res) => {
  console.log("❌ Route tidak ditemukan:", req.originalUrl);
  res.status(404).send("Route tidak ditemukan");
});

export default app;
