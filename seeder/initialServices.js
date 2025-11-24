// seeders/initialServices.js
import { Service } from "../models/index.js";

export const seedInitialServices = async () => {
  try {
    console.log("🌱 Seeding initial services...");

    const servicesData = [
      {
        id: 1,
        name: "Haircut Reguler",
        description: "Potong rambut standar dengan gaya terkini",
        price: 50000,
        duration: 30,
      },
      {
        id: 2,
        name: "Beard Trim",
        description: "Rapikan jenggot dan kumis",
        price: 30000,
        duration: 15,
      },
      {
        id: 3,
        name: "Haircut + Beard",
        description: "Paket lengkap potong rambut dan rapikan jenggot",
        price: 70000,
        duration: 45,
      },
      {
        id: 4,
        name: "Hair Wash",
        description: "Keramas dan pijat kepala",
        price: 25000,
        duration: 20,
      },
    ];

    // Insert atau update services
    for (const serviceData of servicesData) {
      const existingService = await Service.findByPk(serviceData.id);

      if (existingService) {
        await existingService.update(serviceData);
        console.log(`✅ Updated service: ${serviceData.name}`);
      } else {
        await Service.create(serviceData);
        console.log(`✅ Created service: ${serviceData.name}`);
      }
    }

    console.log("🎉 Initial services seeding completed!");
  } catch (err) {
    console.error("❌ Services seeding failed:", err);
  }
};
