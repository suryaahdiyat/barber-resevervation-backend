// scripts/restart.js
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function restart() {
  try {
    console.log("🔄 Starting restart process...");

    // Run syncModels.js
    console.log("📦 Syncing database models...");
    const { stdout: syncOutput } = await execAsync(
      "node scripts/syncModels.js"
    );
    console.log(syncOutput);

    // Run seed.js
    console.log("🌱 Seeding initial data...");
    const { stdout: seedOutput } = await execAsync("node scripts/seed.js");
    console.log(seedOutput);

    console.log("✅ Restart completed successfully!");
  } catch (err) {
    console.error("❌ Restart failed:", err);
    process.exit(1);
  }
}

restart();
