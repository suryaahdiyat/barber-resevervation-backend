// controllers/userController.js
import bcrypt from "bcrypt";
import { Op, where } from "sequelize";
import { User, Reservation } from "../../models/index.js";

// 🔹 Ambil semua user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role"],
      order: [["id", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data user", error: err.message });
  }
};

export const getAllUsersCA = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role"],
      where: { role: { [Op.or]: ["admin", "cashier"] } },
      order: [["id", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data user", error: err.message });
  }
};

export const getAllBarbers = async (req, res) => {
  try {
    const barbers = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role"],
      where: { role: "barber" },
      order: [["id", "DESC"]],
    });
    res.json(barbers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data barber", error: err.message });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role"],
      include: [
        {
          model: Reservation,
          as: "customer_reservations", // Gunakan alias yang didefinisikan di index.js
        },
      ],
      where: { role: "customer" },
      order: [["id", "DESC"]],
    });
    res.json(customers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data customer", error: err.message });
  }
};

// 🔹 Ambil user berdasarkan ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "phone", "role"],
    });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data user", error: err.message });
  }
};

// 🔹 Tambah user baru
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    let condition = [];

    if (email) {
      condition.push({ email });
    }
    if (phone) {
      condition.push({ phone });
    }

    if (!name || condition.length === 0) {
      return res.status(400).json({
        message:
          "Nama dan minimal salah satu dari email atau nomor telepon harus diisi.",
      });
    }

    const allowedroles = ["admin", "cashier", "barber", "customer"];
    if (!allowedroles.includes(role)) {
      return res.status(400).json({ message: "role tidak valid." });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: condition,
      },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email/ No telp sudah terdaftar." });
    }

    const password = "12345678";
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ message: "User berhasil dibuat", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat user", error: err.message });
  }
};

// 🔹 Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    let condition = [];

    if (email) {
      condition.push({ email });
    }
    if (phone) {
      condition.push({ phone });
    }
    // Cek apakah email/phone sudah digunakan oleh user lain
    const existingUser = await User.findOne({
      where: {
        [Op.or]: condition,
        id: { [Op.ne]: req.params.id }, // pastikan bukan dirinya sendiri
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email atau No Telp sudah digunakan oleh user lain.",
      });
    }

    await user.update({
      name,
      email,
      phone,
      role,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    });

    res.json({ message: "User berhasil diperbarui", user });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal memperbarui user", error: err.message });
  }
};

// 🔹 Hapus user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    await user.destroy();
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menghapus user", error: err.message });
  }
};

// 🔹 Login sederhana
export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier bisa email atau phone

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah" });

    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal login", error: err.message });
  }
};
