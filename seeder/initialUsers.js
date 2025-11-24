// seeders/initialUsers.js
import bcrypt from "bcrypt";
import { User } from "../models/index.js";

export const seedInitialUsers = async () => {
  try {
    console.log("🌱 Seeding initial users...");

    // Hash password untuk semua user
    const hashedPassword = await bcrypt.hash("12345678", 10);

    // Data users yang akan di-seed
    const usersData = [
      {
        id: 1,
        name: "Admin MyBarber",
        email: "admin@mybarber.com",
        phone: "081234567890",
        password: hashedPassword,
        role: "admin",
        is_present: true,
      },
      {
        id: 2,
        name: "Kasir MyBarber",
        email: "kasir@mybarber.com",
        phone: "081234567891",
        password: hashedPassword,
        role: "cashier",
        is_present: true,
      },
      {
        id: 3,
        name: "Barber Budi",
        email: "budi@mybarber.com",
        phone: "081234567892",
        password: hashedPassword,
        role: "barber",
        is_present: false,
      },
      {
        id: 4,
        name: "Barber Andi",
        email: "andi@mybarber.com",
        phone: "081234567893",
        password: hashedPassword,
        role: "barber",
        is_present: false,
      },
      {
        id: 5,
        name: "cust",
        email: "cust@mail.id",
        password: hashedPassword,
        role: "customer",
        // is_present: true,
      },
    ];

    // Insert atau update users
    for (const userData of usersData) {
      const existingUser = await User.findByPk(userData.id);

      if (existingUser) {
        await existingUser.update(userData);
        console.log(`✅ Updated user: ${userData.name}`);
      } else {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.name}`);
      }
    }

    console.log("🎉 Initial users seeding completed!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  }
};
