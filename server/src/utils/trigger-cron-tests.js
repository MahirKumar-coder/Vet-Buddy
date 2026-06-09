import dotenv from "dotenv";
import { cleanupExpiredOrders, sendAppointmentReminders, validateGoogleSheetsSync } from "../services/cron.js";
import { getRealtimeDatabase } from "../config/firebase.js";

dotenv.config();

async function runTests() {
  console.log("🧪 Starting Cron Jobs Manual Trigger Suite...\n");
  
  try {
    // Initialize DB
    getRealtimeDatabase();
    console.log("✅ DB initialized for tests");

    // 1. Order cleanup test
    console.log("\n--- Testing Expired Orders Cleanup ---");
    await cleanupExpiredOrders();
    
    // 2. Appointment reminders test
    console.log("\n--- Testing Appointment Reminders Dispatch ---");
    await sendAppointmentReminders();
    
    // 3. Sheets validation test
    console.log("\n--- Testing Sheets Sync Validation ---");
    await validateGoogleSheetsSync();
    
    console.log("\n🎉 All cron test executions finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test execution failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
