import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// const Customer = sequelize.define(
//   "Customer",
//   {
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     phone: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//   },
//   {
//     tableName: "customers", // nama tabel di MySQL
//     createdAt: "created_at", // sesuaikan nama kolom di DB
//     timestamps: false, // otomatis buat createdAt & updatedAt
//   }
// );

// export default Customer;
export default (sequelize) => {
  const Customer = sequelize.define(
    "Customer",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "customers", // nama tabel di MySQL
      createdAt: "created_at", // sesuaikan nama kolom di DB
      timestamps: false, // otomatis buat createdAt & updatedAt
    }
  );
  return Customer;
};
