// models/Reservation.js

import { DataTypes } from "sequelize";

// Kita akan menerima instance sequelize sebagai parameter
export default (sequelize) => {
  const Reservation = sequelize.define(
    "Reservation",
    {
      // id: {
      //     type: DataTypes.INTEGER,
      //     primaryKey: true,
      //     autoIncrement: true,
      //     allowNull: false,
      // },
      // customerId adalah Foreign Key, yang akan otomatis dibuat
      // dan diatur oleh Sequelize saat kita mendefinisikan asosiasi.
      // Walaupun tidak didefinisikan di sini, Sequelize akan mengharapkannya.
      date: {
        type: DataTypes.DATEONLY, // Hanya tanggal
        allowNull: false,
      },
      time: {
        type: DataTypes.TIME, // Hanya waktu
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "ongoing", "done", "cancelled"),
        allowNull: false,
        defaultValue: "pending", // Contoh default status
      },
    },
    {
      tableName: "reservations",
      createdAt: "created_at",
      updatedAt: false,
      timestamps: true,
    }
  );

  return Reservation;
};
