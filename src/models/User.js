import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("kasir", "admin"),
      allowNull: false,
      defaultValue: "kasir",
    },
  },
  {
    tableName: "users", // nama tabel di MySQL
    createdAt: "created_at", // sesuaikan nama kolom di DB
    timestamps: false, // otomatis buat createdAt & updatedAt
  }
);

export default User;
