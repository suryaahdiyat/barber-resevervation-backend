import bcrypt from "bcrypt"; // Menggunakan bcrypt versi terbaru
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// --- KONFIGURASI JWT ---
const SECRET_KEY = process.env.JWT_SECRET;
const EXPIRES_IN = "1d";
// -----------------------

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password harus diisi." });
  }

  try {
    // 1. Cari user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Kredensial tidak valid." });
    }

    // 2. Bandingkan password (dengan hash bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Kredensial tidak valid." });
    }

    // 3. Buat Payload JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.status, // Menggunakan 'status' (kasir/admin) sebagai role
    };

    // 4. Tandatangani dan Buat Token
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });

    // 5. Kirim Token
    res.json({
      message: "Login berhasil!",
      token,
      userId: user.id,
      userRole: user.status,
    });
  } catch (error) {
    console.error("❌ Gagal proses login:", error);
    res.status(500).json({ message: "Terjadi kesalahan server saat login." });
  }
};

export const logoutUser = (req, res) => {
  // Di JWT, logout hanya konfirmasi agar klien menghapus tokennya.
  res.json({
    message: "Logout berhasil. Klien harus menghapus token JWT.",
  });
};
