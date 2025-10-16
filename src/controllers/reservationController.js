import { Reservation, User, Service } from "../../models/index.js";
import { Op } from "sequelize";

// fungsi bantu: deteksi waktu yang bentrok
const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

// 🟢 Ambil semua reservasi
export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      attributes: ["id", "time", "date", "status", "note", "created_at"],
      include: [
        { model: User, as: "customer", attributes: ["id", "name", "phone"] },
        { model: User, as: "barber", attributes: ["id", "name"] },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
    });

    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data reservasi" });
  }
};

// 🟢 Ambil satu reservasi berdasarkan ID
export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: User, as: "customer", attributes: ["id", "name", "phone"] },
        { model: User, as: "barber", attributes: ["id", "name"] },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }

    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data reservasi" });
  }
};

// 🟢 Tambah reservasi baru
export const createReservation = async (req, res) => {
  try {
    const { customer_id, barber_id, service_id, date, time, note } = req.body;

    if (!customer_id || !barber_id || !service_id || !date || !time) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    // ambil durasi dari service
    const service = await Service.findByPk(service_id);
    if (!service)
      return res.status(404).json({ message: "Service tidak ditemukan." });

    const duration = service.duration;
    const startNew = new Date(`${date}T${time}`);
    const endNew = new Date(startNew.getTime() + duration * 60000);

    // ambil semua reservasi barber di tanggal itu
    const existingReservations = await Reservation.findAll({
      where: {
        barber_id,
        date,
        status: { [Op.in]: ["pending", "ongoing", "confirmed"] },
      },
      include: [{ model: Service, as: "service" }],
    });

    // cek overlap
    const conflict = existingReservations.some((r) => {
      const startExisting = new Date(`${r.date}T${r.time}`);
      const endExisting = new Date(
        startExisting.getTime() + r.service.duration * 60000
      );
      return isOverlapping(startExisting, endExisting, startNew, endNew);
    });

    if (conflict) {
      return res.status(400).json({
        message: "Barber sudah memiliki reservasi di waktu tersebut.",
      });
    }

    // simpan reservasi baru
    const newReservation = await Reservation.create({
      customer_id,
      barber_id,
      service_id,
      date,
      time,
      status: "pending",
      note,
    });

    res.status(201).json(newReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat reservasi" });
  }
};

// 🟢 Update status reservasi
export const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = [
      "pending",
      "confirmed",
      "ongoing",
      "done",
      "cancelled",
    ];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid." });
    }

    const reservation = await Reservation.findByPk(id);
    if (!reservation)
      return res.status(404).json({ message: "Reservasi tidak ditemukan." });

    reservation.status = status;
    await reservation.save();

    res.json({ message: "Status reservasi berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui status reservasi" });
  }
};

// 🟢 Hapus reservasi
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);
    if (!reservation)
      return res.status(404).json({ message: "Reservasi tidak ditemukan." });

    await reservation.destroy();
    res.json({ message: "Reservasi berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus reservasi" });
  }
};

// 🟢 Cek ketersediaan barber
export const getAvailableBarbers = async (req, res) => {
  try {
    const { date, time, service_id } = req.query;

    if (!date || !time || !service_id)
      return res
        .status(400)
        .json({ message: "Tanggal, waktu, dan service wajib diisi" });

    const service = await Service.findByPk(service_id);
    if (!service)
      return res.status(404).json({ message: "Service tidak ditemukan" });

    const duration = service.duration;
    const startNew = new Date(`${date}T${time}`);
    const endNew = new Date(startNew.getTime() + duration * 60000);

    const barbers = await User.findAll({
      where: { role: "barber" },
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

    const available = barbers.filter((barber) => {
      if (!barber.barber_reservations.length) return true;

      const conflict = barber.barber_reservations.some((r) => {
        const startExisting = new Date(`${r.date}T${r.time}`);
        const endExisting = new Date(
          startExisting.getTime() + r.service.duration * 60000
        );
        return (
          (r.status === "pending" || r.status === "ongoing") &&
          isOverlapping(startExisting, endExisting, startNew, endNew)
        );
      });

      return !conflict;
    });

    res.json(available);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memeriksa ketersediaan barber" });
  }
};
