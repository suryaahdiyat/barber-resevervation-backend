// jobs/updateReservationStatus.js
import cron from "node-cron";
import { updateReservationStatus } from "../src/utils/updateReservationStatus.js";

// Jalankan setiap 5 menit
cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Running reservation status update...");
  try {
    const result = await updateReservationStatus();
    console.log(
      `✅ Reservation status update completed: ${result.updatedToOngoing} ongoing, ${result.updatedToComplete} complete`
    );
  } catch (error) {
    console.error("❌ Reservation status update failed:", error);
  }
});
