// import Service from "../models/Service.js";
import { Service } from "../models/index.js";

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({ order: [["id", "DESC"]] });
    res.json(services);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data layanan" });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, price, duration, description } = req.body;
    const newService = await Service.create({
      name,
      price,
      duration,
      description,
    });
    res.status(201).json(newService);
  } catch (error) {
    console.error("❌ Gagal tambah service:", error);
    res.status(500).json({ message: "Gagal menambahkan service" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ message: "Service tidak ditemukan" });
    }

    res.json(service);
  } catch (error) {
    console.error("❌ Gagal mengambil data service:", error);
    res.status(500).json({ message: "Gagal mengambil data service" });
  }
};

// 🔹 Update service
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, description } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    service.name = name || service.name;
    service.price = price || service.price;
    service.duration = duration || service.duration;
    service.description = description || service.description;
    await service.save();

    res.json({ message: "Service berhasil diperbarui", service });
  } catch (error) {
    console.error("❌ Gagal mengupdate service:", error);
    res.status(500).json({ message: "Gagal mengupdate service" });
  }
};

// 🔹 Hapus service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ message: "Service tidak ditemukan" });
    }

    await service.destroy();
    res.json({ message: "Service berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal menghapus service:", error);
    res.status(500).json({ message: "Gagal menghapus service" });
  }
};
