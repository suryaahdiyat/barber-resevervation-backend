// import Barber from "../models/Barber.js";
import { Barber } from "../models/index.js";

export const getAllBarbers = async (req, res) => {
  try {
    const barber = await Barber.findAll({ order: [["id", "DESC"]] });
    res.json(barber);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data barber" });
  }
};

export const getAllAvailableBarbers = async (req, res) => {
  try {
    const barber = await Barber.findAll({
      order: [["id", "DESC"]],
      where: { status: "available" },
    });
    res.json(barber);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data barber" });
  }
};

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
