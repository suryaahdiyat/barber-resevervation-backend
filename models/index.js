import sequelize from "../config/db.js";
import UserModel from "./User.js";
import ServiceModel from "./Service.js";
import ReservationModel from "./Reservation.js";
import PaymentModel from "./Payment.js";

const User = UserModel(sequelize);
const Service = ServiceModel(sequelize);
const Reservation = ReservationModel(sequelize);
const Payment = PaymentModel(sequelize);

// 💈 Relasi antar model
User.hasMany(Reservation, {
  foreignKey: "customer_id",
  as: "customer_reservations",
});
Reservation.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customer",
});

User.hasMany(Reservation, {
  foreignKey: "barber_id",
  as: "barber_reservations",
});
Reservation.belongsTo(User, {
  foreignKey: "barber_id",
  as: "barber",
});

Service.hasMany(Reservation, {
  foreignKey: "service_id",
  as: "reservations",
});
Reservation.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

Reservation.hasOne(Payment, {
  foreignKey: "reservation_id",
  as: "payment",
});
Payment.belongsTo(Reservation, {
  foreignKey: "reservation_id",
  as: "reservation",
});
export { sequelize, User, Service, Reservation, Payment };
