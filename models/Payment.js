import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Payment = sequelize.define(
    "Payment",
    {
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM("cash", "transfer", "ewallet"),
        allowNull: false,
      },
      proof: {
        type: DataTypes.STRING, // link bukti pembayaran
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("waiting", "accepted", "rejected"),
        allowNull: true,
        defaultValue: "waiting",
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Payment;
};
