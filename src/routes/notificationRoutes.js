// routes/notificationRoutes.js
import express from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationsWithPagination,
} from "../controllers/notificationController.js";

const router = express.Router();

// GET /api/notifications - Get semua notifications untuk user
router.get("/", getUserNotifications);

// GET /api/notifications/paginated - Get dengan pagination
router.get("/paginated", getNotificationsWithPagination);

// GET /api/notifications/unread/count - Get unread count
router.get("/unread/count", getUnreadCount);

// GET /api/notifications/user/:userId - Get by user ID
router.get("/user/:userId", getUserNotifications);

// PATCH /api/notifications/:id/read - Mark as read
router.patch("/:id/read", markAsRead);

// PATCH /api/notifications/mark-all-read - Mark all as read
router.patch("/mark-all-read", markAllAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", deleteNotification);

// POST /api/notifications - Create new notification (untuk system/admin)
router.post("/", createNotification);

export default router;
