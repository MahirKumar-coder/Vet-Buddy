import cron from "node-cron";
import { getRealtimeDatabase } from "../config/firebase.js";
import { sendEmail } from "./notificationService.js";
import { syncExistingAppointments } from "./firebaseAppointmentListener.js";
import { syncExistingOrders } from "./firebaseOrderListener.js";

// Helper to get local date in YYYY-MM-DD format
const getLocalDateString = () => {
  const date = new Date();
  // Adjust to local time zone (India: UTC+5:30)
  const offset = 5.5 * 60 * 60 * 1000;
  const localDate = new Date(date.getTime() + offset);
  const year = localDate.getUTCFullYear();
  const month = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// HTML email template for appointment reminders
const getReminderHtml = (appointment) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #0ea5e9; padding-bottom: 15px;">
      <h2 style="color: #0ea5e9; margin: 0;">Vet Buddy Patna</h2>
      <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">Pet Appointment Reminder</p>
    </div>
    
    <p>Dear <strong>${appointment.customerName}</strong>,</p>
    
    <p>This is a friendly reminder that you have an upcoming appointment scheduled for your pet today.</p>
    
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #cbd5e1;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 140px;">Service Type:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-size: 15px;">${appointment.serviceType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Pet:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-size: 15px;">${appointment.petType} ${appointment.breed ? `(${appointment.breed})` : ""}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Appointment Date:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-size: 15px;">${appointment.appointmentDate}</td>
        </tr>
        ${appointment.appointmentTime ? `
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Scheduled Time:</td>
          <td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-size: 15px;">${appointment.appointmentTime}</td>
        </tr>
        ` : ""}
      </table>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">If you need to cancel or reschedule, please let us know at least 2 hours prior to the slot.</p>
    
    <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; color: #64748b; font-size: 12px;">
      <p style="margin: 0; font-weight: bold;">Vet Buddy Clinic Patna | 24/7 Pet Care Support</p>
      <p style="margin: 5px 0 0 0;">Contact: +91 8873004339 | Support: support@vetbuddy.com</p>
    </div>
  </div>
`;

// Task 1: Hourly Cleanup of Unpaid Pending Orders (24h expiry window)
export const cleanupExpiredOrders = async () => {
  console.log("🧹 Running hourly unpaid pending orders cleanup task...");
  try {
    const db = getRealtimeDatabase();
    const snapshot = await db.ref("orders").get();
    
    if (!snapshot.exists()) return;
    
    const orders = snapshot.val();
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();
    let cancelledCount = 0;
    
    for (const [id, order] of Object.entries(orders)) {
      if (
        order.status === "pending" &&
        order.paymentStatus === "pending" &&
        order.createdAt &&
        now - Number(order.createdAt) > expiryTime
      ) {
        await db.ref(`orders/${id}`).update({
          status: "cancelled",
          paymentStatus: "expired",
          updatedAt: now,
        });
        console.log(`🧹 Expired order cancelled: ${order.orderId || id}`);
        cancelledCount++;
      }
    }
    
    console.log(`🧹 Order cleanup task finished. Cancelled ${cancelledCount} expired orders.`);
  } catch (error) {
    console.error("❌ Error in cleanupExpiredOrders task:", error.message);
  }
};

// Task 2: Daily Appointment Reminders (9:00 AM)
export const sendAppointmentReminders = async () => {
  console.log("✉️ Running daily appointment reminders dispatch task...");
  try {
    const db = getRealtimeDatabase();
    const snapshot = await db.ref("appointments").get();
    
    if (!snapshot.exists()) return;
    
    const appointments = snapshot.val();
    const today = getLocalDateString();
    let sentCount = 0;
    
    for (const [id, appt] of Object.entries(appointments)) {
      if (
        appt.appointmentDate === today &&
        appt.status !== "cancelled" &&
        appt.reminderSent !== true &&
        appt.customerEmail
      ) {
        const emailHtml = getReminderHtml(appt);
        const emailResult = await sendEmail({
          to: appt.customerEmail,
          subject: `Reminder: Vet Buddy Appointment Today - ${appt.serviceType}`,
          html: emailHtml,
        });
        
        if (emailResult.success) {
          await db.ref(`appointments/${id}`).update({
            reminderSent: true,
            reminderSentAt: Date.now(),
          });
          console.log(`✉️ Appointment reminder sent to: ${appt.customerEmail}`);
          sentCount++;
        }
      }
    }
    
    console.log(`✉️ Reminder dispatch task finished. Sent ${sentCount} reminders.`);
  } catch (error) {
    console.error("❌ Error in sendAppointmentReminders task:", error.message);
  }
};

// Task 3: Daily Google Sheets sync validation (12:00 AM)
export const validateGoogleSheetsSync = async () => {
  console.log("📊 Running daily Google Sheets sync validation task...");
  try {
    await syncExistingAppointments();
    await syncExistingOrders();
    console.log("📊 Google Sheets validation completed successfully.");
  } catch (error) {
    console.error("❌ Error in validateGoogleSheetsSync task:", error.message);
  }
};

// Initialize Scheduler
export const initCronJobs = () => {
  console.log("⏰ Initializing Cron Job Scheduler...");
  
  // Clean up pending unpaid orders hourly (minute 0 of every hour)
  cron.schedule("0 * * * *", cleanupExpiredOrders);
  
  // Send appointment reminders daily at 9:00 AM (09:00)
  cron.schedule("0 9 * * *", sendAppointmentReminders);
  
  // Sync validation daily at midnight (12:00 AM)
  cron.schedule("0 0 * * *", validateGoogleSheetsSync);
  
  console.log("✅ Scheduled Hourly Order Cleanup");
  console.log("✅ Scheduled Daily Appointment Reminders (09:00 AM)");
  console.log("✅ Scheduled Daily Google Sheets Sync Validation (12:00 AM)");
};
