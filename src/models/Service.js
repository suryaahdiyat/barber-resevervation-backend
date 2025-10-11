import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export default (sequelize) => {
  const Service = sequelize.define(
    "Service",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "services", // nama tabel di MySQL
      createdAt: "created_at", // sesuaikan nama kolom di DB
      timestamps: false, // otomatis buat createdAt & updatedAt
    }
  );
  return Service;
};
