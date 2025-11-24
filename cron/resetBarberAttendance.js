import cron from "node-cron";
import {
  resetBarberAttendance,
  initializeBarberAttendance,
} from "../utils/resetBarberAttendance.js";

// Jalankan setiap hari jam 06:00 pagi
cron.schedule("0 6 * * *", async () => {
  console.log("🕕 Running scheduled barber attendance reset...");
  try {
    const result = await resetBarberAttendance();
    console.log(`✅ Scheduled reset completed: ${result.message}`);
  } catch (error) {
    console.error("❌ Scheduled reset failed:", error);
  }
});

// Initialize on server start
initializeBarberAttendance();
