import { getAllAppointmentsFromDB } from "../config/firebase.js";
import { getOrdersFromDB } from "../config/firebase.js";
import { syncAllAppointmentsToSheets } from "../services/appointmentSyncService.js";
import { syncAllOrdersToSheets } from "../services/orderSyncService.js";

export const manualSyncAppointments = async (_req, res) => {
  try {
    console.log("🔄 Manual sync triggered for appointments...");
    const appointments = await getAllAppointmentsFromDB();
    await syncAllAppointmentsToSheets(appointments);
    
    res.json({
      success: true,
      message: `✅ Synced ${appointments.length} appointments to Google Sheets`,
      count: appointments.length,
    });
  } catch (error) {
    console.error("❌ Error during manual appointments sync:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync appointments",
      error: error.message,
    });
  }
};

export const manualSyncOrders = async (_req, res) => {
  try {
    console.log("🔄 Manual sync triggered for orders...");
    const orders = await getOrdersFromDB();
    await syncAllOrdersToSheets(orders);
    
    res.json({
      success: true,
      message: `✅ Synced ${orders.length} orders to Google Sheets`,
      count: orders.length,
    });
  } catch (error) {
    console.error("❌ Error during manual orders sync:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync orders",
      error: error.message,
    });
  }
};

export const manualSyncAll = async (_req, res) => {
  try {
    console.log("🔄 Manual sync triggered for all data...");
    
    const appointments = await getAllAppointmentsFromDB();
    const orders = await getOrdersFromDB();
    
    await syncAllAppointmentsToSheets(appointments);
    await syncAllOrdersToSheets(orders);
    
    res.json({
      success: true,
      message: "✅ All data synced successfully",
      data: {
        appointmentsSynced: appointments.length,
        ordersSynced: orders.length,
      },
    });
  } catch (error) {
    console.error("❌ Error during manual sync:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync data",
      error: error.message,
    });
  }
};

export default {
  manualSyncAppointments,
  manualSyncOrders,
  manualSyncAll,
};
