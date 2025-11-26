// utils/updateReservationStatus.js
import { Reservation, Service } from "../../models/index.js";
import { Op } from "sequelize";

/**
 * Auto-update status reservasi berdasarkan waktu
 * - confirmed → ongoing (saat waktu reservasi tiba)
 * - ongoing → complete (setelah waktu reservasi + durasi service selesai)
 */
export async function updateReservationStatus() {
  try {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

    console.log(
      `🕒 Auto-updating reservation status at ${today} ${currentTime}`
    );

    // 1. Ambil semua reservasi yang perlu diupdate
    const reservations = await Reservation.findAll({
      where: {
        status: {
          [Op.in]: ["confirmed", "ongoing"],
        },
        date: {
          [Op.in]: [
            today,
            new Date(new Date().setDate(new Date().getDate() - 1)),
          ], // Hari ini dan kemarin (untuk yang mungkin belum diupdate)
        },
      },
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "duration"],
        },
      ],
    });

    console.log(`📋 Found ${reservations.length} reservations to check`);

    let updatedToOngoing = 0;
    let updatedToComplete = 0;

    for (const reservation of reservations) {
      const reservationDateTime = new Date(
        `${reservation.date}T${reservation.time}`
      );
      const serviceEndTime = new Date(
        reservationDateTime.getTime() + reservation.service.duration * 60000
      );

      // Logic update status
      if (
        reservation.status === "confirmed" &&
        now >= reservationDateTime &&
        now < serviceEndTime
      ) {
        // Ubah confirmed → ongoing (waktu reservasi sudah tiba, service belum selesai)
        await reservation.update({ status: "ongoing" });
        updatedToOngoing++;
        console.log(`🔄 Reservation #${reservation.id} updated to ongoing`);
      } else if (reservation.status === "ongoing" && now >= serviceEndTime) {
        // Ubah ongoing → complete (service sudah selesai)
        await reservation.update({ status: "complete" });
        updatedToComplete++;
        console.log(`✅ Reservation #${reservation.id} updated to complete`);
      }
    }

    console.log(
      `🎉 Status update completed: ${updatedToOngoing} to ongoing, ${updatedToComplete} to complete`
    );

    return {
      success: true,
      updatedToOngoing,
      updatedToComplete,
      totalProcessed: reservations.length,
    };
  } catch (error) {
    console.error("❌ Error updating reservation status:", error);
    throw error;
  }
}

// Manual trigger untuk testing
export const manualUpdateReservationStatus = async (req, res) => {
  try {
    const result = await updateReservationStatus();
    res.json({
      success: true,
      message: "Manual reservation status update completed",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
