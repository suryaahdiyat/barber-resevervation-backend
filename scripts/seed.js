// scripts/seed.js
import { runAllSeeders } from "../seeder/index.js";

runAllSeeders().then(() => {
  console.log("Seeding finished!");
  process.exit(0);
});
