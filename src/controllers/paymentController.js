import { Payment, Reservation, User, Service } from "../../models/index.js";
import fs from "fs";
import path from "path";
/**
 * Membuat pembayaran untuk reservasi tertentu
 * Biasanya dilakukan oleh pelanggan
 */
export const createPayment = async (req, res) => {
  try {
    const { reservation_id, method, amount } = req.body;

    if (!reservation_id || !method) {
      return res.status(400).json({ message: "Data pembayaran tidak lengkap" });
    }

    const allowedMethod = ["cash", "transfer", "ewallet"];
    if (!allowedMethod.includes(method)) {
      return res.status(400).json({ message: "method tidak valid." });
    }

    // Pastikan reservasi ada
    const reservation = await Reservation.findByPk(reservation_id, {
      include: [{ model: Service, as: "service" }],
    });
    if (!reservation) {
      return res.status(404).json({ message: "Reservasi tidak ditemukan" });
    }

    // return res.status(200).json(reservation.service.price);

    // Cegah duplikasi pembayaran
    const existing = await Payment.findOne({ where: { reservation_id } });
    if (existing) {
      return res.status(400).json({ message: "Pembayaran sudah dibuat" });
    }

    const payment = await Payment.create({
      reservation_id,
      method,
      amount: reservation.service.price,
    });

    res.status(201).json({
      message: "Pembayaran berhasil dibuat",
      data: payment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat pembayaran" });
  }
};

/**
 * Menampilkan semua pembayaran (Admin/Kasir)
 */
export const getAllPayments = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const payments = await Payment.findAll({
      where,
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [{ model: Service, as: "service" }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data pembayaran" });
  }
};

/**
 * Mendapatkan detail pembayaran berdasarkan ID
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [{ model: Service, as: "service" }],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    }

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil detail pembayaran" });
  }
};

export const getPaymentByReservationId = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findOne({
      where: { reservation_id: id },
      include: [
        {
          model: Reservation,
          as: "reservation",
          include: [
            {
              model: User,
              as: "customer",
              attributes: ["id", "name", "phone"],
            },
            {
              model: Service,
              as: "service",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    }

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil detail pembayaran" });
  }
};

export const updatePaymentByAdmin = async (req, res) => {
  try {
    // const { id } = req.params;
    const { payment_method } = req.body;

    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan " });
    }

    if (req.file) {
      if (payment.proof) {
        const oldPath = path.join(process.cwd(), "uploads", payment.proof);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log("🗑️ Gambar lama dihapus:", payment.proof);
        }
      }
      // Simpan path baru
      payment.proof = `payments/${req.file.filename}`;
    }

    //hapus jika proof == null
    if (req.body.proof === "null" && payment.proof) {
      const oldPath = path.join(process.cwd(), "uploads", payment.proof);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
        console.log("🗑️ Gambar dihapus oleh user:", payment.proof);
      }
      payment.proof = null;
    }

    await payment.update({
      method: payment_method,
      proof: payment.proof,
    });

    res.json({ message: "Pembayaran berhasil diperbarui", payment });
  } catch (err) {
    res.status(500).json({
      message: "Gagal memperbarui pembayaran",
      error: err.message,
    });
  }
};

/**
 * Mengubah status pembayaran (Kasir/Admin)
 * status: accepted | rejected
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    }

    payment.status = status;
    await payment.save();

    res.json({ message: `Status pembayaran diperbarui menjadi ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui status pembayaran" });
  }
};

/**
 * (Opsional) Update bukti pembayaran
 */
export const updatePaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const { proof } = req.body; // nanti bisa diganti upload file

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    }

    payment.proof = proof;
    await payment.save();

    res.json({ message: "Bukti pembayaran diperbarui", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal memperbarui bukti pembayaran" });
  }
};

// delete payment jika tidak dibayar dalam 30 menit
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
    }
    await payment.destroy();
    res.json({ message: "Pembayaran berhasil dihapus" });
  } catch (err) {
    res
      .staus(500)
      .json({ message: "Gagal menghapus pembayaran", error: err.message });
  }
};
