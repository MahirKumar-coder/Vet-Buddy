import { getRealtimeDatabase } from "../config/firebase.js";
import { syncAppointmentToSheets, syncAllAppointmentsToSheets } from "./appointmentSyncService.js";
import { sendMultiChannelNotification } from "./notificationService.js";

let appointmentsListener = null;

// Validate appointment data
const validateAppointmentData = (appointment) => {
  const errors = [];
  if (!appointment.customerName) errors.push("Missing customerName");
  if (!appointment.customerPhone) errors.push("Missing customerPhone");
  if (!appointment.appointmentDate) errors.push("Missing appointmentDate");
  if (!appointment.serviceType) errors.push("Missing serviceType");
  if (!appointment.petType) errors.push("Missing petType");
  
  // Validate email format only if it is provided and not empty
  if (appointment.customerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(appointment.customerEmail)) {
      errors.push(`Invalid email format: ${appointment.customerEmail}`);
    }
  }
  
  return errors;
};

// Send Notification helper for appointments
const notifyAppointment = async (appointment) => {
  try {
    // Validate appointment data before sending
    const validationErrors = validateAppointmentData(appointment);
    if (validationErrors.length > 0) {
      console.error(`❌ Appointment validation failed for ${appointment.id}:`, validationErrors);
      return { success: false, validationErrors };
    }

    const isOnlineConsult = appointment.serviceType === "Online consultation";
    
    let customerSubject, customerHtml;
    let adminSubject, adminHtml;

    if (isOnlineConsult) {
      // 🩺 Video Consultation Alerts
      customerSubject = "Your Vet Buddy Video Consultation is Registered! 🩺";
      customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0ea5e9; text-align: center;">Vet Buddy Patna</h2>
          <h3 style="color: #1e293b; border-bottom: 2px solid #38bdf8; padding-bottom: 8px;">Video Consultation Confirmed!</h3>
          <p>Hi <strong>${appointment.customerName}</strong>,</p>
          <p>Thank you for choosing Vet Buddy. We have successfully registered your online video consultation.</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #0369a1;">Appointment Summary:</h4>
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="font-weight: bold; width: 40%; padding: 4px 0;">Service:</td><td>Video Consultation</td></tr>
              <tr><td style="font-weight: bold; padding: 4px 0;">Preferred Date:</td><td>${appointment.appointmentDate}</td></tr>
              <tr><td style="font-weight: bold; padding: 4px 0;">Pet Type:</td><td>${appointment.petType}</td></tr>
              <tr><td style="font-weight: bold; padding: 4px 0;">Amount Paid:</td><td>₹299 (Paid)</td></tr>
              <tr><td style="font-weight: bold; padding: 4px 0;">Symptoms/Notes:</td><td>${appointment.notes || "None"}</td></tr>
            </table>
          </div>
          <p>Our care team is currently setting up a secure video connection. We will reach out to you at <strong>${appointment.customerPhone}</strong> with your Google Meet link shortly.</p>
          <p style="margin-top: 25px; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
            Vet Buddy Clinic, Patna, Bihar. For immediate queries, contact us on our emergency support.
          </p>
        </div>
      `;

      adminSubject = `🚨 NEW PAID ONLINE CONSULTATION: ${appointment.customerName}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #fda4af; border-radius: 12px; background-color: #fff1f2;">
          <h2 style="color: #e11d48; margin-top: 0;">🚨 Urgent: New Paid Online Consultation!</h2>
          <p>Customer has paid <strong>₹299</strong>. Please schedule a Google Meet slot.</p>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #fecdd3;">Customer:</td><td style="padding: 6px; border-bottom: 1px solid #fecdd3;">${appointment.customerName}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #fecdd3;">Phone:</td><td style="padding: 6px; border-bottom: 1px solid #fecdd3;">${appointment.customerPhone}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #fecdd3;">Email:</td><td style="padding: 6px; border-bottom: 1px solid #fecdd3;">${appointment.customerEmail || "Not provided"}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #fecdd3;">Pet Type:</td><td style="padding: 6px; border-bottom: 1px solid #fecdd3;">${appointment.petType}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #fecdd3;">Date:</td><td style="padding: 6px; border-bottom: 1px solid #fecdd3;">${appointment.appointmentDate}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px;">Notes:</td><td style="padding: 6px;">${appointment.notes || "None"}</td></tr>
          </table>
        </div>
      `;

    } else {
      // 📅 Standard In-clinic Appointment
      customerSubject = "Your Vet Buddy Clinic Appointment Request 📅";
      customerHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0ea5e9; text-align: center;">Vet Buddy Patna</h2>
          <h3 style="color: #1e293b; border-bottom: 2px solid #38bdf8; padding-bottom: 8px;">Clinic Visit Request Received!</h3>
          <p>Hi <strong>${appointment.customerName}</strong>,</p>
          <p>We have successfully received your clinic appointment request. Our care team is verifying the slots and will confirm your exact slot shortly.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #475569;">Request Details:</h4>
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="font-weight: bold; width: 40%; padding: 4px 0;">Service:</td><td>${appointment.serviceType}</td></tr>
              <tr><td style="font-weight: bold; padding: 4px 0;">Preferred Date:</td><td>${appointment.appointmentDate}</td></tr>
              <tr><td style="font-weight: bold; padding: 4px 0;">Pet Type:</td><td>${appointment.petType}</td></tr>
              <tr><td style="font-weight: bold; padding: 4px 0;">Notes:</td><td>${appointment.notes || "None"}</td></tr>
            </table>
          </div>
          <p>We will call or email you shortly at <strong>${appointment.customerPhone}</strong> to confirm your slot time.</p>
          <p style="margin-top: 25px; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
            Vet Buddy Clinic, Patna, Bihar.
          </p>
        </div>
      `;

      adminSubject = `📅 NEW CLINIC APPOINTMENT REQUEST: ${appointment.customerName}`;
      adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #334155; margin-top: 0;">📅 New Clinic Appointment Request</h2>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #e2e8f0;">Customer:</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${appointment.customerName}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #e2e8f0;">Phone:</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${appointment.customerPhone}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #e2e8f0;">Email:</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${appointment.customerEmail || "Not provided"}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #e2e8f0;">Service:</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${appointment.serviceType}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #e2e8f0;">Pet Type:</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${appointment.petType}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px; border-bottom: 1px solid #e2e8f0;">Preferred Date:</td><td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${appointment.appointmentDate}</td></tr>
            <tr><td style="font-weight: bold; padding: 6px;">Notes:</td><td style="padding: 6px;">${appointment.notes || "None"}</td></tr>
          </table>
          <p>Please call the customer to confirm their slot time.</p>
        </div>
      `;
    }

    console.log(`📧 Sending notifications for appointment ${appointment.id} to ${appointment.customerEmail}`);

    // Trigger Email notifications
    await sendMultiChannelNotification({
      customerEmail: appointment.customerEmail || "",
      customerSubject,
      customerHtml,
      adminSubject,
      adminHtml,
      adminEmail: appointment.doctorEmail || process.env.ADMIN_EMAIL,
    });

    // Mark as notified in Firebase Realtime Database
    const db = getRealtimeDatabase();
    await db.ref(`appointments/${appointment.id}`).update({
      notificationSent: true,
      notificationSentAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log(`✅ Appointment notifications sent and marked for: ${appointment.id} (Email: ${appointment.customerEmail})`);
    return { success: true, appointmentId: appointment.id, email: appointment.customerEmail };
  } catch (err) {
    console.error(`❌ Failed to send appointment notifications for ${appointment.id}:`, err.message);
    console.error("Error details:", err);
    return { success: false, error: err.message };
  }
};

// Set up real-time listener for appointments
export const setupAppointmentsListener = async () => {
  try {
    const db = getRealtimeDatabase();
    const appointmentsRef = db.ref("appointments");

    appointmentsListener = appointmentsRef.on(
      "child_added",
      async (snapshot) => {
        const appointmentData = snapshot.val();
        const appointmentId = snapshot.key;

        const appointment = {
          id: appointmentId,
          ...appointmentData,
        };

        console.log(`📍 New appointment detected: ${appointmentId}`, {
          name: appointmentData.customerName,
          email: appointmentData.customerEmail,
          service: appointmentData.serviceType,
        });

        // 1. Sync to Google Sheets
        await syncAppointmentToSheets(appointment);

        // 2. Trigger notifications if not already sent
        if (appointmentData.notificationSent !== true) {
          // If online consultation, wait until paid; otherwise notify instantly for clinic requests
          const isOnlineConsult = appointment.serviceType === "Online consultation";
          if (!isOnlineConsult || appointment.paymentStatus === "paid") {
            console.log(`💌 Triggering notification for ${appointmentId}:`, { isOnlineConsult, paymentStatus: appointment.paymentStatus });
            const result = await notifyAppointment(appointment);
            if (!result.success) {
              console.warn(`⚠️  Notification send skipped for ${appointmentId}:`, result);
            }
          } else {
            console.log(`⏳ Notification pending for online consultation ${appointmentId} - waiting for payment`);
          }
        }
      },
      (error) => {
        console.error("❌ Error in appointments listener:", error.message);
      }
    );

    // Also listen for updates (useful to detect payment confirmation for online consults)
    appointmentsRef.on(
      "child_changed",
      async (snapshot) => {
        const appointmentData = snapshot.val();
        const appointmentId = snapshot.key;

        const appointment = {
          id: appointmentId,
          ...appointmentData,
        };

        console.log(`📍 Appointment updated: ${appointmentId}`);
        await syncAppointmentToSheets(appointment);

        // If online consult gets paid, trigger notification
        if (
          appointment.serviceType === "Online consultation" &&
          appointment.paymentStatus === "paid" &&
          appointmentData.notificationSent !== true
        ) {
          await notifyAppointment(appointment);
        }
      },
      (error) => {
        console.error("❌ Error in appointments update listener:", error.message);
      }
    );

    console.log("✅ Appointments listener setup complete");
  } catch (error) {
    console.error("❌ Error setting up appointments listener:", error.message);
  }
};

// Sync all existing appointments on startup
export const syncExistingAppointments = async () => {
  try {
    const db = getRealtimeDatabase();
    const appointmentsRef = db.ref("appointments");

    const snapshot = await appointmentsRef.once("value");
    const appointmentsData = snapshot.val();

    if (!appointmentsData) {
      console.log("✅ No existing appointments to sync");
      return;
    }

    const appointments = Object.entries(appointmentsData).map(([id, data]) => ({
      id,
      ...data,
    }));

    await syncAllAppointmentsToSheets(appointments);
  } catch (error) {
    console.error("❌ Error syncing existing appointments:", error.message);
  }
};

// Clean up listener
export const stopAppointmentsListener = () => {
  if (appointmentsListener) {
    const db = getRealtimeDatabase();
    db.ref("appointments").off();
    console.log("✅ Appointments listener stopped");
  }
};

export default {
  setupAppointmentsListener,
  syncExistingAppointments,
  stopAppointmentsListener,
};
