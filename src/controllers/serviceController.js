// controllers/serviceController.js
import { Service } from "../../models/index.js";

// 🔹 Ambil semua service
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [["id", "DESC"]],
    });
    res.json(services);
  } catch (err) {
    res.status(500).json({
      message: "Gagal mengambil data service",
      error: err.message,
    });
  }
};

// 🔹 Ambil service berdasarkan ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service)
      return res.status(404).json({ message: "Service tidak ditemukan" });
    res.json(service);
  } catch (err) {
    res.status(500).json({
      message: "Gagal mengambil data service",
      error: err.message,
    });
  }
};

// 🔹 Tambah service baru
export const createService = async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;

    if (!name || !price || !duration) {
      return res.status(400).json({ message: "Semua field harus diisi." });
    }

    const newService = await Service.create({
      name,
      price,
      duration,
      description,
    });

    res
      .status(201)
      .json({ message: "Service berhasil dibuat", service: newService });
  } catch (err) {
    res.status(500).json({
      message: "Gagal membuat service",
      error: err.message,
    });
  }
};

// 🔹 Update service
export const updateService = async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;
    const service = await Service.findByPk(req.params.id);

    if (!service)
      return res.status(404).json({ message: "Service tidak ditemukan" });

    await service.update({
      name,
      price,
      duration,
      description,
    });

    res.json({ message: "Service berhasil diperbarui", service });
  } catch (err) {
    res.status(500).json({
      message: "Gagal memperbarui service",
      error: err.message,
    });
  }
};

// 🔹 Hapus service
export const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service)
      return res.status(404).json({ message: "Service tidak ditemukan" });

    await service.destroy();
    res.json({ message: "Service berhasil dihapus" });
  } catch (err) {
    res.status(500).json({
      message: "Gagal menghapus service",
      error: err.message,
    });
  }
};
