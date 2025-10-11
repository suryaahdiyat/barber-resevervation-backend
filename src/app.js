import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customersRoutes.js";
import barberRoutes from "./routes/barbersRoutes.js";
import userRoutes from "./routes/usersRoutes.js";
import servicesRoutes from "./routes/servicesRoutes.js";
import reservationsRoute from "./routes/reservationsRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("API Barber Reservation aktif 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/barbers", barberRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/reservations", reservationsRoute);

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
