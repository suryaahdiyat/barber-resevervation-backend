// src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";

// Ganti dengan KUNCI RAHASIA (Secret Key) yang sama saat Anda membuat token!
// IDEALNYA, nilai ini diambil dari environment variable (misalnya: process.env.JWT_SECRET)
// const SECRET_KEY = "b4rB3r_r3s3RvAti0N_k3y_971c2f4e8d3b0a6c5f0e1d2c3b4a5e6f";
const SECRET_KEY = process.env.JWT_SECRET;

export const protect = (req, res, next) => {
  // 1. Ambil nilai dari header Authorization
  const authHeader = req.headers.authorization;

  // Cek apakah token ada dan berformat 'Bearer <token>'
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // 401: Unauthorized - Token tidak ada
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token otorisasi diperlukan." });
  }

  // Ambil bagian tokennya saja
  const token = authHeader.split(" ")[1];

  try {
    // 2. Verifikasi token menggunakan kunci rahasia
    const decoded = jwt.verify(token, SECRET_KEY);

    // 3. (Opsional) Lampirkan data user yang sudah dienkripsi ke objek req
    // sehingga bisa diakses di kontroler.
    req.user = decoded;

    // 4. Jika token valid, lanjutkan ke fungsi berikutnya (kontroler)
    next();
  } catch (error) {
    // 403: Forbidden - Token tidak valid atau kedaluwarsa
    return res.status(403).json({
      message: "Token tidak valid atau kedaluwarsa. Silakan login kembali.",
    });
  }
};
