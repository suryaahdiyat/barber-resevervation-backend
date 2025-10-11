// src/controllers/customerController.js
// import Customer from "../models/Customer.js";
import { Customer, Reservation } from "../models/index.js";

export const getAllCustomers = async (req, res) => {
  try {
    // const customers = await Customer.findAll({ order: [["id", "DESC"]] });
    // res.json(customers);

    // Mendapatkan semua customer, menyertakan semua reservasi mereka (Eager Loading)
    const customers = await Customer.findAll({
      include: [
        {
          model: Reservation,
          as: "reservations", // Gunakan alias yang didefinisikan di index.js
        },
      ],
      order: [["id", "DESC"]],
    });
    res.json(customers);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data pelanggan" });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const newCustomer = await Customer.create({ name, phone });
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("❌ Gagal tambah customer:", error);
    res.status(500).json({ message: "Gagal menambahkan customer" });
  }
};

// Ambil customer berdasarkan ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    // 💡 Perubahan: Menggunakan 'include' untuk mengambil Reservation terkait
    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: Reservation,
          as: "reservations", // Gunakan alias yang didefinisikan
        },
      ],
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    res.json(customer);
  } catch (error) {
    console.error("❌ Gagal mengambil data customer:", error);
    res.status(500).json({ message: "Gagal mengambil data customer" });
  }
};

// 🔹 Update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;
    await customer.save();

    res.json({ message: "Customer berhasil diperbarui", customer });
  } catch (error) {
    console.error("❌ Gagal mengupdate customer:", error);
    res.status(500).json({ message: "Gagal mengupdate customer" });
  }
};

// 🔹 Hapus customer
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    // const customer = await Customer.findByPk(id);

    // Karena Anda sudah mengatur onDelete: 'CASCADE' pada relasi HasMany,
    // menghapus Customer ini akan secara otomatis menghapus semua Reservation terkait.
    const deletedRows = await Customer.destroy({
      where: { id: id },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    res.json({ message: "Customer berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal menghapus customer:", error);
    res.status(500).json({ message: "Gagal menghapus customer" });
  }
};
