// utils/dailyBarberCheck.js
import { Reservation, User, Service, Payment } from "../../models/index.js";
import { Op } from "sequelize";
import { notifyAdminRefundRequired } from "../utils/notificationHelper.js";

export async function checkAndReassignBarbers() {
  try {
    const today = new Date().toISOString().split("T")[0];
    console.log(`🔍 Running daily barber check for ${today}...`);

    // 1. Ambil semua reservasi confirmed untuk hari ini
    const todayReservations = await Reservation.findAll({
      where: {
        date: today,
        status: "confirmed",
      },
      include: [
        {
          model: User,
          as: "barber",
          attributes: ["id", "name", "is_present"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration"],
        },
        {
          model: Payment,
          as: "payment",
          attributes: ["id", "amount", "method"],
        },
      ],
    });

    console.log(`📋 Found ${todayReservations.length} reservations for today`);

    for (const reservation of todayReservations) {
      // 2. Cek apakah barber assigned hadir hari ini
      const currentBarber = reservation.barber;

      if (!currentBarber.is_present) {
        console.log(
          `🚨 Barber ${currentBarber.name} is absent for reservation ${reservation.id}`
        );

        // 3. Cari barber lain yang available
        const availableBarbers = await getAvailableBarbersForReservation(
          reservation.date,
          reservation.time,
          reservation.service_id,
          currentBarber.id // exclude current barber
        );

        if (availableBarbers.length > 0) {
          // 4. Pilih random barber dari yang available
          const randomIndex = Math.floor(
            Math.random() * availableBarbers.length
          );
          const newBarber = availableBarbers[randomIndex];

          // 5. Update reservation dengan barber baru
          await reservation.update({ barber_id: newBarber.id });

          console.log(
            `✅ Reservation ${reservation.id} reassigned from ${currentBarber.name} to ${newBarber.name}`
          );

          // 6. TODO: Kirim notifikasi ke customer
          // await sendReassignmentNotification(reservation, newBarber);
        } else {
          // 7. Tidak ada barber available → update status untuk admin
          await reservation.update({ status: "need_admin_review" });

          //ubah status pembayran menjadi refund_pending
          const payment = await Payment.findByPk(reservation.payment.id);
          payment.update({
            status: "refund_pending",
          });

          console.log(
            `❌ No available barbers for reservation ${reservation.id}, admin notified`
          );

          // 8. TODO: Kirim alert ke admin
          notifyAdminRefundRequired(reservation);
          // console.log(reservation);
        }
      } else {
        console.log(
          `✅ Barber ${currentBarber.name} is present for reservation ${reservation.id}`
        );
      }
    }

    console.log("🎉 Daily barber check completed");
  } catch (error) {
    console.error("❌ Error in daily barber check:", error);
  }
}

// Function untuk mendapatkan available barbers (modified dari yang existing)
async function getAvailableBarbersForReservation(
  date,
  time,
  serviceId,
  excludeBarberId
) {
  try {
    const service = await Service.findByPk(serviceId);
    if (!service) return [];

    const duration = service.duration;
    const startNew = new Date(`${date}T${time}`);
    const endNew = new Date(startNew.getTime() + duration * 60000);

    const barbers = await User.findAll({
      where: {
        role: "barber",
        is_present: true,
        id: { [Op.ne]: excludeBarberId }, // Exclude current absent barber
      },
      include: [
        {
          model: Reservation,
          as: "barber_reservations",
          required: false,
          where: { date },
          include: [{ model: Service, as: "service" }],
        },
      ],
    });

    const availableBarbers = barbers.filter((barber) => {
      if (!barber.barber_reservations.length) return true;

      const conflict = barber.barber_reservations.some((r) => {
        const startExisting = new Date(`${r.date}T${r.time}`);
        const endExisting = new Date(
          startExisting.getTime() + r.service.duration * 60000
        );

        return (
          (r.status === "confirmed" || r.status === "ongoing") &&
          isOverlapping(startExisting, endExisting, startNew, endNew)
        );
      });

      return !conflict;
    });

    return availableBarbers;
  } catch (error) {
    console.error("Error in getAvailableBarbersForReservation:", error);
    return [];
  }
}

// Helper function untuk cek waktu bentrok (sama seperti yang existing)
function isOverlapping(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

// Manual trigger by route
export const manualTriggerBarberCheck = async (req, res) => {
  try {
    const result = await checkAndReassignBarbers();
    res.json({
      success: true,
      message: "Manual barber check completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Manual trigger error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
