import { Reservation, Customer, Barber, Service } from "../models/index.js";

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: Customer, as: "customer" },
        { model: Barber, as: "barber" },
        { model: Service, as: "service" },
      ],
      order: [["id", "DESC"]],
    });
    res.json(reservations);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data reservasi" });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Barber, as: "barber" },
        { model: Service, as: "service" },
      ],
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }
    res.json(reservation);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data reservasi" });
  }
};

// POST /api/reservations
export const createReservation = async (req, res) => {
  try {
    const { name, phone, barber_id, service_id, date, time, status } = req.body;

    // Cek apakah customer sudah ada
    let customer = await Customer.findOne({ where: { phone } });

    // Jika belum ada, buat baru
    if (!customer) {
      customer = await Customer.create({ name, phone });
    }

    if (!customer || !barber_id || !service_id || !time || !date) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const allowedStatues = ["pending", "ongoing", "done", "cancelled"];
    if (!allowedStatues.includes(status) && status) {
      return res.status(400).json({
        message:
          "Status tidak valid, harus salah satu dari: " +
          allowedStatues.join(", "),
      });
    }

    // Buat reservasi
    const reservation = await Reservation.create({
      customer_id: customer.id,
      barber_id,
      service_id,
      date,
      time,
      status,
    });

    res.status(201).json({
      message: "Reservasi berhasil dibuat",
      reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat reservasi" });
  }
};

// export const createReservation = async (req, res) => {
//   const { customer_id, barber_id, service_id, time, date, status } = req.body;

//   if (!customer_id || !barber_id || !service_id || !time || !date) {
//     return res.status(400).json({ message: "Semua field harus diisi" });
//   }

//   const allowedStatues = ["pending", "ongoing", "done", "cancelled"];
//   if (!allowedStatues.includes(status) && status) {
//     return res.status(400).json({
//       message:
//         "Status tidak valid, harus salah satu dari: " +
//         allowedStatues.join(", "),
//     });
//   }
//   try {
//     const newReservation = await Reservation.create({
//       customer_id,
//       barber_id,
//       service_id,
//       time,
//       date,
//       status,
//     });
//     res.status(201).json(newReservation);
//   } catch (error) {
//     console.error("❌ Gagal tambah reservasi:", error);
//     res.status(500).json({ message: "Gagal menambahkan reservasi" });
//   }
// };

export const updateReservation = async (req, res) => {
  const { id } = req.params;
  const { barber_id, service_id, time, date, status } = req.body;

  const allowedStatues = ["pending", "ongoing", "done", "cancelled"];
  if (!allowedStatues.includes(status) && status) {
    return res.status(400).json({
      message:
        "Status tidak valid, harus salah satu dari: " +
        allowedStatues.join(", "),
    });
  }

  try {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }

    // reservation.customer_id = reservation.cu
    reservation.barber_id = barber_id || reservation.barber_id;
    reservation.service_id = service_id || reservation.service_id;
    reservation.time = time || reservation.time;
    reservation.date = date || reservation.date;
    reservation.status = status || reservation.status;
    await reservation.save();

    res.json({ message: "Reservasi berhasil diperbarui", reservation });
  } catch (error) {
    console.error("❌ Gagal mengupdate reservasi:", error);
    res.status(500).json({ message: "Gagal mengupdate reservasi" });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;
    // const reservation = await Reservation.findByPk(id)

    const deletedRows = await Reservation.destroy({
      where: { id: id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }

    res.json({ message: "Reservasi berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal menghapus reservasi:", error);
    res.status(500).json({ message: "Gagal menghapus reservasi" });
  }
};
