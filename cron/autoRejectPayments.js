// import cron from "node-cron";
// import { Payment, Reservation } from "../models/index.js";
// import { Op } from "sequelize";

// // Jalankan setiap 5 menit
// cron.schedule("* * * * *", async () => {
//   // cron.schedule("*/5 * * * *", async () => {
//   const now = new Date();
//   console.log(
//     `⏰ [CRON] at ${now.toISOString().split("T")[0]}, ${now
//       .toTimeString()
//       .slice(0, 5)} ...`
//   );

//   try {
//     // Ambil semua payment waiting dengan reservasi yang sudah lewat waktunya
//     const expiredPayments = await Payment.findAll({
//       where: { status: "waiting" },
//       include: [
//         {
//           model: Reservation,
//           as: "reservation",
//           where: {
//             [Op.or]: [
//               // tanggal sebelum hari ini
//               { date: { [Op.lt]: now.toISOString().split("T")[0] } },
//               // tanggal sama, tapi waktu sudah lewat
//               {
//                 [Op.and]: [
//                   { date: now.toISOString().split("T")[0] },
//                   { time: { [Op.lt]: now.toTimeString().slice(0, 5) } },
//                 ],
//               },
//             ],
//           },
//         },
//       ],
//     });

//     for (const payment of expiredPayments) {
//       await payment.update({ status: "rejected" });
//       await payment.reservation.update({ status: "cancelled" });
//       console.log(
//         `🚫 Auto-reject: reservasi ${payment.reservation.id} sudah lewat.`
//       );
//     }

//     if (expiredPayments.length === 0) {
//       console.log("✅ Tidak ada pembayaran yang perlu di-reject.");
//     }
//   } catch (err) {
//     console.error("❌ Gagal menjalankan cron autoRejectPayments:", err);
//   }
// });
import cron from "node-cron";
import { Payment } from "../models/index.js";
import { checkPaymentDeadline } from "../src/utils/checkPaymentDeadline.js";

cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  console.log(
    `⏰ [CRON] at ${now.toISOString().split("T")[0]}, ${now
      .toTimeString()
      .slice(0, 5)} ...`
  );
  const payments = await Payment.findAll({
    include: [{ all: true }],
  });

  // Optimized: hanya ambil yang relevant
  // const payments = await Payment.findAll({
  //   where: {
  //     status: "waiting",
  //     created_at: {
  //       [Op.lt]: new Date(Date.now() - (5 * 60 * 1000))
  //     }
  //   },
  //   include: [{ model: Reservation, as: "reservation" }]
  // });
  await checkPaymentDeadline(payments);
});
