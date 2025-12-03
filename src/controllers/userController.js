// controllers/userController.js
import bcrypt from "bcrypt";
import { Op, where } from "sequelize";
import { User, Reservation, Service, Payment } from "../../models/index.js";

// 🔹 Ambil semua user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role"],
      order: [["name", "ASC"]],
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
      order: [["name", "ASC"]],
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
    const { is_present } = req.query; // Optional filter

    const whereCondition = { role: "barber" };
    if (is_present !== undefined) {
      whereCondition.is_present = is_present === "true";
    }

    whereCondition.role = "barber";

    const barbers = await User.findAll({
      attributes: ["id", "name", "email", "phone", "is_present"],
      where: whereCondition,
      order: [["name", "ASC"]],
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
      // where: customerid == req.params.id,
      attributes: ["id", "name", "email", "phone", "role"],
      include: [
        {
          model: Reservation,
          as: "customer_reservations",
          // where: reservationWhere,
          attributes: ["id", "date", "time", "status"],
          // require: false,
          include: [
            {
              model: Service,
              as: "service",
              attributes: ["name"],
            },
            // {
            //   model: Payment,
            //   as: "payment",
            //   where: paymentWhere,
            // },
          ],
        },
      ],
    });
    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan123" });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data user", error: err.message });
  }
};

export const searchUser = async (req, res) => {
  try {
    const { query } = req.query; // ambil dari ?query=...
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ message: "Parameter pencarian tidak boleh kosong" });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } },
        ],
      },
      attributes: ["id", "name", "email", "phone"],
    });

    if (users.length === 0)
      return res.status(404).json({ message: "Tidak ada user yang cocok" });

    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal melakukan pencarian user", error: err.message });
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

export const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password, id } = req.body;

    if (!current_password || !new_password || !confirm_password || !id) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    if (new_password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "Konfirmasi password tidak cocok." });
    }

    const user = await User.findByPk(id);
    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan." });

    // ✅ Cek password lama
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah." });
    }

    // ✅ Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);

    await user.update({ password: hashedPassword });

    return res.json({ message: "Password berhasil diperbarui." });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Gagal mengubah password.", error: err.message });
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

// 🔹 Update barber presence status
export const updateBarberPresence = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_present } = req.body;

    const barber = await User.findOne({
      where: {
        id,
        role: "barber",
      },
    });

    if (!barber) {
      return res.status(404).json({ message: "Barber tidak ditemukan" });
    }

    await barber.update({ is_present });

    res.json({
      message: "Status kehadiran berhasil diperbarui",
      barber: {
        id: barber.id,
        name: barber.name,
        is_present: barber.is_present,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Gagal memperbarui status kehadiran",
      error: err.message,
    });
  }
};

// 🔹 Get all barbers with presence status
export const getBarbersWithPresence = async (req, res) => {
  try {
    const barbers = await User.findAll({
      attributes: ["id", "name", "is_present"],
      where: { role: "barber" },
      order: [["name", "ASC"]],
    });

    res.json(barbers);
  } catch (err) {
    res.status(500).json({
      message: "Gagal mengambil data barber",
      error: err.message,
    });
  }
};

// 🔹 Get barber with presence status by id
export const getBarberWithPresenceById = async (req, res) => {
  try {
    const { id } = req.params;
    const barbers = await User.findOne({
      attributes: ["id", "name", "is_present"],
      where: {
        id,
        role: "barber",
      },
    });

    res.json(barbers);
  } catch (err) {
    res.status(500).json({
      message: "Gagal mengambil data barber",
      error: err.message,
    });
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
