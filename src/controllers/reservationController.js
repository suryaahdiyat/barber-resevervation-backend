import {
  createNotification,
  notifyAdminNewReservation,
  notifyReservationAccepted,
  notifyReservationRejected,
} from "../utils/notificationHelper.js";
import { Reservation, User, Service, Payment } from "../../models/index.js";
import { Op, where } from "sequelize";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
// fungsi bantu: deteksi waktu yang bentrok
const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

// 🟢 Ambil semua reservasi
export const getReservations = async (req, res) => {
  try {
    const { status, date } = req.query;
    const whereCondition = {};

    if (status && status !== "all") whereCondition.status = status;
    if (date) whereCondition.date = date;

    const reservations = await Reservation.findAll({
      where: whereCondition,
      attributes: ["id", "time", "date", "status", "note", "created_at"],
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "phone", "email"],
        },
        { model: User, as: "barber", attributes: ["id", "name"] },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
        {
          model: Payment,
          as: "payment",
          attributes: ["id", "method", "status"],
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

export const getReservationsByUserId = async (req, res) => {
  try {
    const { status, date } = req.query;
    const reservationWhere = {};
    const paymentWhere = {};
    // const id = req.params.id;

    if (status && status !== "all") paymentWhere.status = status;
    if (date) reservationWhere.date = date;

    const reservations = await Reservation.findAll({
      where: {
        customer_id: req.params.id,
        ...reservationWhere,
      },
      // attributes: ["id", "time", "date", "status", "note", "created_at"],
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "phone", "email"],
        },
        { model: User, as: "barber", attributes: ["id", "name"] },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
        {
          model: Payment,
          as: "payment",
          where: paymentWhere,
          attributes: ["id", "method", "status"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
      // where: id,
    });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data reservasi" });
  }
};

// get barber reservation
export const getReservationsByBarberId = async (req, res) => {
  try {
    const { status, date } = req.query;

    const reservationWhere = {};

    if (date) reservationWhere.date = date;

    if (status && status !== "all") reservationWhere.status = status;

    const reservations = await Reservation.findAll({
      where: {
        barber_id: req.params.id,
        [Op.not]: {
          status: "cancelled",
        },
        ...reservationWhere,
      },
      // attributes: ["id", "time", "date", "status", "note", "created_at"],
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "phone", "email"],
        },
        { model: User, as: "barber", attributes: ["id", "name"] },
        {
          model: Service,
          as: "service",
          attributes: ["id", "name", "duration", "price"],
        },
        {
          model: Payment,
          as: "payment",
          where: {
            [Op.not]: {
              status: "rejected",
            },
          },
          attributes: ["id", "method", "status"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
      // where: id,
    });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Gagal mengambil data reservasi in barber" });
  }
};

export const searchReservation = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ message: "Parameter pencarian tidak boleh kosong" });
    }

    const reservation = await Reservation.findAll({
      where: {
        [Op.or]: [
          { "$customer.name$": { [Op.like]: `%${query}%` } },
          { "$customer.email$": { [Op.like]: `%${query}%` } },
          { "$customer.phone$": { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: ["id", "time", "date", "status", "note", "created_at"],
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "phone", "email"],
        },
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

    if (reservation.length === 0) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }

    res.json(reservation);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal melakukan pencarian user", error: err.message });
  }
};

// 🟢 Tambah reservasi baru
export const createReservation = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      barber_id,
      service_id,
      date,
      time,
      note,
      payment_method,
    } = req.body;

    let condition = [];

    if (email) {
      condition.push({ email });
    }
    if (phone) {
      condition.push({ phone });
    }

    if (condition.length === 0) {
      return res.status(400).json({
        message:
          "Minimal salah satu dari email atau nomor telepon harus diisi.",
      });
    }

    if (!name || !barber_id || !service_id || !date || !time) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    let user = await User.findOne({
      where: {
        [Op.or]: condition,
      },
    });

    if (!user) {
      const password = "12345678";
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role: "customer",
      });
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

    // 🔥 TENTUKAN STATUS BERDASARKAN TANGGAL
    const today = new Date().toISOString().split("T")[0];
    const status = date > today ? "pre_booked" : "pending";

    // simpan reservasi baru
    const newReservation = await Reservation.create({
      customer_id: user.id,
      barber_id,
      service_id,
      date,
      time,
      status: status,
      note,
    });

    await Payment.create({
      reservation_id: newReservation.id,
      amount: service.price,
      method: payment_method,
    });

    if (status) {
      const reservationWithDetails = await Reservation.findByPk(
        newReservation.id,
        {
          include: [
            { model: User, as: "customer", attributes: ["id", "name"] },
            { model: User, as: "barber", attributes: ["id", "name"] },
            { model: Service, as: "service", attributes: ["name"] },
          ],
        }
      );

      await notifyAdminNewReservation(reservationWithDetails);
    }

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

    if (status == "confirmed") {
      notifyReservationAccepted(reservation);
    }
    if (status == "cancelled") {
      notifyReservationRejected(reservation, "Pembayaran anda tidak valid");
    }

    res.json({ message: "Status reservasi berhasil diperbarui." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui status reservasi" });
  }
};

// 🟢 Hapus reservasi
// export const deleteReservation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const reservation = await Reservation.findByPk(id, {
//       include: [{ model: Payment, as: "payment" }],
//     });

//     if (!reservation)
//       return res.status(404).json({ message: "Reservasi tidak ditemukan." });

//     const payment = await Payment.findByPk(reservation.payment.id);

//     if (!payment)
//       return res.status(404).json({ message: "Pembayaran tidak ditemukan" });

//     // Hapus gambar dari folder
//     if (payment.proof) {
//       const filePath = path.join(process.cwd(), "uploads", payment.proof);
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//         console.log("🗑️ File gambar dihapus:", payment.proof);
//       }
//     }

//     await reservation.destroy();
//     await payment.destroy();
//     res.json({ message: "Reservasi berhasil dihapus." });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Gagal menghapus reservasi" });
//   }
// };

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil reservasi beserta payment-nya
    const reservation = await Reservation.findByPk(id, {
      include: [{ model: Payment, as: "payment" }],
    });

    if (!reservation)
      return res.status(404).json({ message: "Reservasi tidak ditemukan." });

    const payment = reservation.payment;

    if (payment) {
      // Hapus gambar bukti pembayaran (jika ada)
      if (payment.proof) {
        const filePath = path.join(process.cwd(), "uploads", payment.proof);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("🗑️ File gambar dihapus:", payment.proof);
          }
        } catch (err) {
          console.warn("⚠️ Gagal menghapus file:", err.message);
        }
      }

      // Hapus data payment
      await payment.destroy();
    }

    // Hapus data reservasi
    await reservation.destroy();

    res.json({ message: "Reservasi (beserta pembayaran) berhasil dihapus." });
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
      where: {
        role: "barber",
        is_present: true, // ← HANYA barber yang hadir hari ini
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
