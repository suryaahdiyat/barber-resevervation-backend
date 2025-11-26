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
