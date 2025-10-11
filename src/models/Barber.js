import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export default (sequelize) => {
  const Barber = sequelize.define(
    "Barber",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: DataTypes.ENUM("available", "busy", "off"),
        allowNull: false,
      },
    },
    {
      tableName: "barbers", // nama tabel di MySQL
      createdAt: "created_at", // sesuaikan nama kolom di DB
      timestamps: false, // otomatis buat createdAt & updatedAt
    }
  );
  return Barber;
};
