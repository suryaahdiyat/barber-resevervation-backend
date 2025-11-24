// models/Notification.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Notification = sequelize.define(
    "Notification",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("info", "success", "warning", "error"),
        defaultValue: "info",
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      related_entity: {
        type: DataTypes.STRING, // 'reservation', 'payment', 'system'
        allowNull: true,
      },
      related_entity_id: {
        type: DataTypes.INTEGER, // ID dari reservation/payment/etc
        allowNull: true,
      },
      action_url: {
        type: DataTypes.STRING, // URL untuk redirect ketika notif diklik
        allowNull: true,
      },
    },
    {
      tableName: "notifications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Notification;
};
