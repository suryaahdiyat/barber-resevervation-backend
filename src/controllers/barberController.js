// import Barber from "../models/Barber.js";
import { Op } from "sequelize";
import { Barber, Reservation, Service } from "../models/index.js";

export const getAllBarbers = async (req, res) => {
  try {
    const barber = await Barber.findAll({ order: [["id", "DESC"]] });
    res.json(barber);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data barber" });
  }
};

// helper untuk cek overlap antar waktu
const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

export const getAllAvailableBarbers = async (req, res) => {
  try {
    const { date, time, serviceId } = req.query;

    if (!date || !time || !serviceId) {
      return res
        .status(400)
        .json({ message: "Tanggal, waktu, dan serviceId wajib diisi" });
    }

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service tidak ditemukan" });
    }

    // ambil semua barber dengan reservasi di tanggal itu
    const barbers = await Barber.findAll({
      include: [
        {
          model: Reservation,
          as: "reservations",
          required: false, // biar barber tanpa reservasi tetap muncul
          where: { date },
          include: [{ model: Service, as: "service" }],
        },
      ],
    });

    const duration = service.duration; // durasi service baru
    const startNew = new Date(`${date}T${time}`);
    const endNew = new Date(startNew.getTime() + duration * 60000); // tambah menit ke milidetik

    // filter barber yang tidak bentrok
    const availableBarbers = barbers.filter((barber) => {
      // jika belum ada reservasi sama sekali, langsung lolos
      if (!barber.reservations || barber.reservations.length === 0) return true;

      // cek semua reservasi di tanggal itu
      const hasConflict = barber.reservations.some((r) => {
        const startExisting = new Date(`${r.date}T${r.time}`);
        const endExisting = new Date(
          startExisting.getTime() + r.service.duration * 60000
        );
        return (
          (r.status === "pending" || r.status === "ongoing") &&
          isOverlapping(startExisting, endExisting, startNew, endNew)
        );
      });

      return !hasConflict; // hanya barber yang tidak bentrok
    });

    res.json(availableBarbers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memeriksa ketersediaan barber" });
  }
};

// export const getAllAvailableBarbers = async (req, res) => {
//   try {
//     const barber = await Barber.findAll({
//       order: [["id", "DESC"]],
//       where: { status: "available" },
//     });
//     res.json(barber);
//   } catch (error) {
//     console.error("❌ Gagal ambil data:", error);
//     res.status(500).json({ message: "Gagal mengambil data barber" });
//   }
// };

// export const getAvailableBarbers = async (date, time, serviceId) => {
//   const service = await Service.findByPk(serviceId);
//   const duration = service.duration; // dalam menit

//   const availableBarbers = await Barber.findAll({
//     where: {
//       id: {
//         [Op.notIn]: Sequelize.literal(`
//           (SELECT barber_id FROM reservations
//            JOIN services ON reservations.service_id = services.id
//            WHERE reservations.date = '${date}'
//            AND (
//              (TIME('${time}') < ADDTIME(reservations.time, SEC_TO_TIME(services.duration * 60)))
//              AND (reservations.time < ADDTIME('${time}', SEC_TO_TIME(${duration} * 60)))
//            )
//            AND reservations.status IN ('pending', 'ongoing'))
//         `),
//       },
//     },
//   });

//   return availableBarbers;
// };

export const createBarber = async (req, res) => {
  try {
    const { name, phone, status } = req.body;
    const newBarber = await Barber.create({ name, phone, status });
    res.status(201).json(newBarber);
  } catch (error) {
    console.error("❌ Gagal tambah Barber:", error);
    res.status(500).json({ message: "Gagal menambahkan Barber" });
  }
};

// Ambil Barber berdasarkan ID
export const getBarberById = async (req, res) => {
  try {
    const { id } = req.params;
    // const ed = 1;
    const barber = await Barber.findByPk(id);
    // console.log(Barber);

    if (!barber) {
      return res.status(404).json({ message: "Barber tidak ditemukan" });
    }

    res.json(barber);
  } catch (error) {
    console.error("❌ Gagal mengambil data Barber:", error);
    res.status(500).json({ message: "Gagal mengambil data Barber" });
  }
};

// 🔹 Update Barber
export const updateBarber = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, status } = req.body;

    const barber = await Barber.findByPk(id);
    if (!barber) {
      return res.status(404).json({ message: "Barber tidak ditemukan" });
    }

    barber.name = name || barber.name;
    barber.phone = phone || barber.phone;
    barber.status = status || barber.status;
    await barber.save();

    res.json({ message: "Barber berhasil diperbarui", barber });
  } catch (error) {
    console.error("❌ Gagal mengupdate Barber:", error);
    res.status(500).json({ message: "Gagal mengupdate Barber" });
  }
};

// 🔹 Hapus Barber
export const deleteBarber = async (req, res) => {
  try {
    const { id } = req.params;
    const barber = await Barber.findByPk(id);

    if (!barber) {
      return res.status(404).json({ message: "Barber tidak ditemukan" });
    }

    await barber.destroy();
    res.json({ message: "Barber berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal menghapus Barber:", error);
    res.status(500).json({ message: "Gagal menghapus Barber" });
  }
};
