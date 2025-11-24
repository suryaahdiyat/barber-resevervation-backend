// seeders/index.js
import { seedInitialUsers } from "./initialUsers.js";
import { seedInitialServices } from "./initialServices.js";

export const runAllSeeders = async () => {
  try {
    console.log("🚀 Starting all seeders...");

    await seedInitialUsers();
    await seedInitialServices();

    console.log("🎉 All seeders completed successfully!");
  } catch (err) {
    console.error("❌ Seeding process failed:", err);
  }
};
