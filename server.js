import app from "./src/app.js";
import dotenv from "dotenv";
import "./cron/autoRejectPayments.js";
import "./cron/updateReservationStatus.js";
// import "./cron/resetBarberAttendance.js";
// import "./cron/dailyBarberCheck.js"

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
