// jobs/dailyBarberCheck.js
import cron from "node-cron";
import { checkAndReassignBarbers } from "../utils/dailyBarberCheck.js";

// Jalankan setiap hari jam 8 pagi
cron.schedule("0 8 * * *", async () => {
  console.log("🕖 Running scheduled daily barber availability check...");
  await checkAndReassignBarbers();
});
