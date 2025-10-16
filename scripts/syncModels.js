// scripts/syncModels.js
import { sequelize } from "../models/index.js";

(async () => {
  try {
    console.log("🔄 Memulai sinkronisasi database...");

    // Membuat semua tabel dari model yang sudah didefinisikan
    await sequelize.sync({ force: true });
    // alter
    // Gunakan { force: true } jika mau DROP tabel lama dan buat ulang dari awal
    // Hati-hati! force akan menghapus semua data lama.

    console.log(
      "✅ Sinkronisasi selesai! Semua tabel sudah dibuat atau diperbarui."
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat sinkronisasi:", err);
    process.exit(1);
  }
})();
