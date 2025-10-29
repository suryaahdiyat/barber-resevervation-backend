// controllers/serviceController.js
import { Service } from "../../models/index.js";
import { Op, where } from "sequelize";
import fs from "fs";
import path from "path";

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

export const searchService = async (req, res) => {
  try {
    const { query } = req.query; // ambil dari ?query=...
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ message: "Parameter pencarian tidak boleh kosong" });
    }

    const services = await Service.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: ["id", "name", "price", "description"],
    });

    if (services.length === 0)
      return res.status(404).json({ message: "Tidak ada service yang cocok" });

    res.json(services);
  } catch (err) {
    res.status(500).json({
      message: "Gagal melakukan pencarian service",
      error: err.message,
    });
  }
};

// 🔹 Tambah service baru
export const createService = async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;
    // const picture = req.file ? req.file.filename : null;
    const picture = req.file ? `services/${req.file.filename}` : null;

    if (!name || !price || !duration) {
      return res.status(400).json({ message: "Semua field harus diisi." });
    }

    const newService = await Service.create({
      name,
      description,
      price,
      duration,
      picture,
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

    // Kalau user upload gambar baru
    if (req.file) {
      // Hapus gambar lama (jika ada)
      if (service.picture) {
        const oldPath = path.join(process.cwd(), "uploads", service.picture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log("🗑️ Gambar lama dihapus:", service.picture);
        }
      }

      // Simpan path baru
      service.picture = `services/${req.file.filename}`;
      // service.picture = `uploads/services/${req.file.filename}`;
    }

    //hapus jika picture == null
    if (req.body.picture === "null" && service.picture) {
      const oldPath = path.join(process.cwd(), "uploads", service.picture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log("🗑️ Gambar dihapus oleh user:", service.picture);
      }
      service.picture = null;
    }

    await service.update({
      name,
      price,
      duration,
      description,
      picture: service.picture,
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

    // Hapus gambar dari folder
    if (service.picture) {
      const filePath = path.join(process.cwd(), "uploads", service.picture);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑️ File gambar dihapus:", service.picture);
      }
    }

    await service.destroy();
    res.json({ message: "Service berhasil dihapus" });
  } catch (err) {
    res.status(500).json({
      message: "Gagal menghapus service",
      error: err.message,
    });
  }
};
