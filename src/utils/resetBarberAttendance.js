import { User } from "../../models/index.js";

export async function resetBarberAttendance() {
  try {
    console.log("🔄 Resetting barber attendance...");

    const result = await User.update(
      { is_present: false },
      {
        where: {
          role: "barber",
          is_present: true,
        },
      }
    );

    console.log(`✅ Reset ${result[0]} barber attendance to false`);
    return {
      success: true,
      resetCount: result[0],
      message: `Reset ${result[0]} barber attendance to false`,
    };
  } catch (err) {
    console.error("❌ Failed to reset barber attendance:", err);
    throw err;
  }
}

// Manual trigger by route
export const manualResetBarberAttendance = async (req, res) => {
  try {
    const result = await resetBarberAttendance();
    res.json({
      success: true,
      message: "Manual barber attendance reset completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Manual reset error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Check and reset on server start if needed
export async function initializeBarberAttendance() {
  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour >= 6) {
    console.log("🚀 Server started after 6 AM, checking attendance reset...");
    try {
      const result = await resetBarberAttendance();
      console.log(`✅ Initial attendance reset: ${result.message}`);
      return result;
    } catch (error) {
      console.error("❌ Initial attendance reset failed:", error);
    }
  } else {
    console.log(
      "⏰ Server started before 6 AM, attendance reset will run at 6 AM"
    );
  }
}
