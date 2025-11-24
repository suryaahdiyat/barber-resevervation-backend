// utils/checkPaymentDeadline.js
// import { Payment, Reservation } from "../../models/index.js";

// /**
//  * Mengecek apakah payment sudah melewati batas waktu pembayaran (default 30 menit).
//  * Jika sudah lewat dan belum accepted/rejected → auto reject.
//  *
//  * @param {Payment|Array<Payment>} payments - bisa satu objek Payment atau array Payment
//  * @param {number} limitMinutes - durasi batas waktu (default: 30)
//  */
// export async function checkPaymentDeadline(payments, limitMinutes = 5) {
//   if (!payments) return;

//   const now = new Date();
//   const deadlineMs = limitMinutes * 60 * 1000;
//   const paymentsArray = Array.isArray(payments) ? payments : [payments];

//   for (const payment of paymentsArray) {
//     // Lewati kalau sudah accepted/rejected
//     if (["accepted", "rejected"].includes(payment.status)) continue;

//     const createdAt = new Date(payment.created_at);
//     const deadline = new Date(createdAt.getTime() + deadlineMs);

//     // Jika lewat waktu dan belum dibayar
//     if (now > deadline) {
//       await payment.update({ status: "rejected" });

//       // Update reservation-nya juga jadi cancelled
//       if (payment.reservation_id) {
//         await Reservation.update(
//           { status: "cancelled" },
//           { where: { id: payment.reservation_id } }
//         );
//       }

//       console.log(
//         `💸 Payment #${payment.id} otomatis ditolak (lewat batas waktu pembayaran)`
//       );
//     }
//   }
// }
// utils/checkPaymentDeadline.js
import { Payment, Reservation } from "../../models/index.js";
import { notifyReservationRejected } from "./notificationHelper.js";

/**
 * Mengecek payment yang sudah melewati batas waktu:
 * 1. Batas waktu pembayaran (default 30 menit dari created_at)
 * 2. Atau waktu reservasi sudah lewat (jika reservation_time sudah terlewat)
 *
 * @param {Payment|Array<Payment>} payments - bisa satu objek Payment atau array Payment
 * @param {number} limitMinutes - durasi batas waktu pembayaran (default: 30)
 */
export async function checkPaymentDeadline(payments, limitMinutes = 30) {
  if (!payments) return;

  const now = new Date();
  const deadlineMs = limitMinutes * 60 * 1000;
  const paymentsArray = Array.isArray(payments) ? payments : [payments];

  for (const payment of paymentsArray) {
    // Lewati kalau sudah accepted/rejected
    if (
      ["accepted", "rejected", "refund_pending", "refunded"].includes(
        payment.status
      )
    )
      continue;

    let shouldReject = false;
    let reason = "";
    let reservation = null;

    // Cek 1: Batas waktu pembayaran (30 menit dari created_at)
    const createdAt = new Date(payment.created_at);
    const paymentDeadline = new Date(createdAt.getTime() + deadlineMs);

    if (now > paymentDeadline) {
      shouldReject = true;
      reason = `lewat batas waktu pembayaran (${limitMinutes} menit)`;
    }

    // Cek 2: Waktu reservasi sudah lewat (jika ada reservation_id)
    if (!shouldReject && payment.reservation_id) {
      reservation = await Reservation.findByPk(payment.reservation_id);
      // console.log("Reservation data:", JSON.stringify(reservation, null, 2)); // Debug
      if (reservation && reservation.date && reservation.time) {
        const reservationTime = new Date(
          `${reservation.date}T${reservation.time}`
        );

        // Jika waktu reservasi sudah lewat (bahkan tanpa toleransi)
        if (now > reservationTime) {
          shouldReject = true;
          reason = "waktu reservasi sudah terlewat";
          // console.log("Should reject because reservation time passed"); // Debug
        }
      }
      // console.log(reservation);
    }
    // console.log(reservation);

    // Auto reject jika memenuhi kondisi di atas
    if (shouldReject) {
      await payment.update({ status: "rejected" });

      // Update reservation-nya juga jadi cancelled
      // Cari reservation jika belum ada
      if (!reservation && payment.reservation_id) {
        reservation = await Reservation.findByPk(payment.reservation_id);
      }

      if (reservation) {
        await reservation.update({ status: "cancelled" });
      }

      // Update reservation-nya juga jadi cancelled
      // if (reservation.id) {
      //   reservation.update(
      //     { status: "cancelled" }
      //     // { where: { id: payment.reservation_id } }
      //   );
      // }

      //notify in here
      if (reservation.status == "cancelled") {
        notifyReservationRejected(reservation, reason);
      }
      console.log(`💸 Payment #${payment.id} otomatis ditolak (${reason})`);
    }
  }
}
