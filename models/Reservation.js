import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Reservation = sequelize.define(
    "Reservation",
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "ongoing", "confirmed", "cancelled"),
        allowNull: true,
        defaultValue: "pending",
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "reservations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Reservation;
};
