import bcrypt from "bcrypt";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [["id", "DESC"]] });
    res.json(users);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

export const createUser = async (req, res) => {
  // 1. Ambil data dari body request
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Semua field harus diisi." });
  }

  const allowedroles = ["kasir", "admin"];
  if (!allowedroles.includes(role)) {
    return res
      .status(400)
      .json({ message: 'role tidak valid. Harus "kasir" atau "admin".' });
  }

  try {
    // 2. Cek email yang sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }

    // 3. Hashing Password (Menggunakan bcrypt)
    // genSalt(10): Membuat salt dengan cost factor 10 (standar yang baik)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Buat dan Simpan User Baru
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Simpan HASHED password
      role,
    });

    // 5. Kirim respons sukses
    res.status(201).json({
      message: "User berhasil ditambahkan!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ Gagal menambahkan user:", error);
    res.status(500).json({ message: "Gagal menambahkan data user" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.password = password
      ? await bcrypt.hash(password, await bcrypt.genSalt(10))
      : user.password;
    await user.save();

    res.json({ message: "User berhasil diperbarui", user });
  } catch (error) {
    console.error("❌ Gagal mengupdate user:", error);
    res.status(500).json({ message: "Gagal mengupdate data user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    await user.destroy();
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal menghapus user:", error);
    res.status(500).json({ message: "Gagal menghapus data user" });
  }
};
