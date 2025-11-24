// controllers/notificationController.js
import { Notification, User } from "../../models/index.js";

// 🔹 Get semua notifications untuk user tertentu
export const getUserNotifications = async (req, res) => {
  try {
    // TODO: Ambil user_id dari auth middleware nanti
    // Untuk sementara, kita pakai query parameter atau hardcode
    const userId = req.query.user_id || req.params.userId || 1; // Sementara hardcode user 1

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: 50,
    });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengambil data notifikasi",
      error: err.message,
    });
  }
};

// 🔹 Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.query.user_id || req.params.userId || 1;

    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    res.json({ unread_count: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengambil count notifikasi",
      error: err.message,
    });
  }
};

// 🔹 Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }

    await notification.update({ is_read: true });

    res.json({
      message: "Notifikasi ditandai sudah dibaca",
      notification,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengupdate notifikasi",
      error: err.message,
    });
  }
};

// 🔹 Mark all as read untuk user
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.body.user_id || 1; // Sementara hardcode

    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );

    res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengupdate notifikasi",
      error: err.message,
    });
  }
};

// 🔹 Hapus notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }

    await notification.destroy();

    res.json({ message: "Notifikasi berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal menghapus notifikasi",
      error: err.message,
    });
  }
};

// 🔹 Buat notification baru (untuk internal use - admin/system)
export const createNotification = async (req, res) => {
  try {
    const {
      user_id,
      title,
      message,
      type,
      related_entity,
      related_entity_id,
      action_url,
    } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        message: "User ID, title, dan message harus diisi",
      });
    }

    const notification = await Notification.create({
      user_id,
      title,
      message,
      type: type || "info",
      related_entity,
      related_entity_id,
      action_url,
    });

    res.status(201).json({
      message: "Notifikasi berhasil dibuat",
      notification,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal membuat notifikasi",
      error: err.message,
    });
  }
};

// 🔹 Get notifications dengan pagination
export const getNotificationsWithPagination = async (req, res) => {
  try {
    const userId = req.query.user_id || 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    res.json({
      notifications,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: limit,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengambil data notifikasi",
      error: err.message,
    });
  }
};
