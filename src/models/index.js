// models/index.js (File untuk menghubungkan model)

import sequelize from "../config/db.js"; // Koneksi Sequelize Anda
import CustomerModel from "./Customer.js";
import BarberModel from "./Barber.js";
import ServiceModel from "./Service.js";
import ReservationModel from "./Reservation.js";

const Customer = CustomerModel(sequelize);
const Barber = BarberModel(sequelize);
const Service = ServiceModel(sequelize);
const Reservation = ReservationModel(sequelize);

// --- DEFINISI ASOSIASI (RELASI ONE-TO-MANY) ---

// Customer memiliki banyak Reservation
Customer.hasMany(Reservation, {
  foreignKey: "customer_id", // Nama kolom kunci asing di tabel 'reservations'
  as: "reservations", // Alias untuk Eager Loading: customer.getReservations()
  onDelete: "CASCADE", // Jika Customer dihapus, semua Reservation-nya ikut terhapus
});

Barber.hasMany(Reservation, {
  foreignKey: "barber_id",
  as: "reservations",
  onDelete: "SET NULL", // jika barber dihapus, set barber_id di reservation menjadi NULL
});

Service.hasMany(Reservation, {
  foreignKey: "service_id",
  as: "reservations",
  onDelete: "SET NULL",
});

// Reservation dimiliki oleh satu Customer
Reservation.belongsTo(Customer, {
  foreignKey: "customer_id", // Harus cocok dengan foreignKey di atas
  as: "customer", // Alias untuk Eager Loading: reservation.getCustomer()
});

Reservation.belongsTo(Barber, {
  foreignKey: "barber_id",
  as: "barber",
});

Reservation.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});

// Anda kini dapat mengekspor model-model yang sudah berelasi
export { sequelize, Customer, Barber, Service, Reservation };
