// utils/notificationHelper.js
import { Notification, User } from "../../models/index.js";

/**
 * Buat notification sederhana
 */
export const createNotification = async (
  userId,
  title,
  message,
  type = "info",
  relatedData = null
) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      related_entity: relatedData?.entity || null,
      related_entity_id: relatedData?.entityId || null,
      action_url: relatedData?.actionUrl || null,
    });

    console.log(`📢 Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (err) {
    console.error("❌ Failed to create notification:", err);
    return null;
  }
};

/**
 * Notifikasi untuk reservation assigned
 */
export const notifyReservationAccepted = async (reservation) => {
  const customerId = reservation.customer_id;

  return await createNotification(
    customerId,
    "Pembayaran reservasi berhasil!",
    `Reservasi kamu untuk ${reservation.date} jam ${reservation.time} telah dikonfirmasi`,
    "success",
    {
      entity: "reservation",
      entityId: reservation.id,
      actionUrl: `/reservations/${reservation.id}`,
    }
  );
};

export const notifyReservationRejected = async (reservation, reason) => {
  const customerId = reservation.customer_id;

  return await createNotification(
    customerId,
    "Pembayaran reservasi gagal!",
    reason,
    "error",
    {
      entity: "reservation",
      entityId: reservation.id,
      actionUrl: `/reservations/${reservation.id}`,
    }
  );
};

/**
 * Notifikasi untuk admin tentang refund required
 */
export const notifyAdminRefundRequired = async (reservation) => {
  const adminUsers = await User.findAll({ where: { role: "admin" } });

  for (const admin of adminUsers) {
    await createNotification(
      admin.id,
      "💰 Refund Required",
      `Reservasi #${reservation.id} dibatalkan. Silakan proses refund sebesar Rp ${reservation.payment.amount}`,
      "warning",
      {
        entity: "payment",
        entityId: reservation.payment.id,
        actionUrl: `/admin/payments/${reservation.payment.id}`,
      }
    );
  }
};

/**
 * Notifikasi ke customer tentang pembatalan
 */
export const notifyCustomerCancelled = async (reservation) => {
  await createNotification(
    reservation.customer_id,
    "❌ Reservasi Dibatalkan",
    `Reservasi untuk ${reservation.date} jam ${reservation.time} dibatalkan karena tidak ada barber available. Refund akan diproses.`,
    "error",
    {
      entity: "reservation",
      entityId: reservation.id,
    }
  );
};

/**
 * Notifikasi barber replacement (opsional - tanpa notif ke customer)
 */
export const notifyBarberReplaced = async (
  reservation,
  oldBarber,
  newBarber
) => {
  // Hanya notify admin, customer tidak perlu tahu
  const adminUsers = await User.findAll({ where: { role: "admin" } });

  for (const admin of adminUsers) {
    await createNotification(
      admin.id,
      "🔄 Barber Diganti",
      `Reservasi #${reservation.id}: Barber ${oldBarber.name} diganti dengan ${newBarber.name}`,
      "info",
      {
        entity: "reservation",
        entityId: reservation.id,
      }
    );
  }
};

export const notifyAdminNewReservation = async (reservation) => {
  const adminUsers = await User.findAll({ where: { role: "admin" } });

  const reservationType =
    reservation.status === "pre_booked" ? "Pre-booked" : "Same-day";

  for (const admin of adminUsers) {
    await createNotification(
      admin.id,
      "📅 Reservasi Baru",
      `${reservationType} reservasi dari ${reservation.customer.name} untuk ${reservation.date} dengan ${reservation.barber.name}`,
      "info",
      {
        entity: "reservation",
        entityId: reservation.id,
        actionUrl: `/admin/reservations/${reservation.id}`,
      }
    );
  }
};
