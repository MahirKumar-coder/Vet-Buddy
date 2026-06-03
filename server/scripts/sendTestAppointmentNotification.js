import 'dotenv/config';
import { sendMultiChannelNotification } from "../src/services/notificationService.js";

const appointment = {
  id: "test-appointment-001",
  customerName: "Test User",
  customerEmail: process.env.TEST_EMAIL || "recipient@example.com",
  customerPhone: "+911234567890",
  petType: "Dog",
  appointmentDate: "2026-06-01 10:00",
  serviceType: "Clinic visit",
  notes: "This is a test appointment notification",
};

const customerSubject = `Test: Appointment confirmed for ${appointment.customerName}`;
const customerHtml = `<div><h3>Hi ${appointment.customerName}</h3><p>This is a test appointment confirmation for ${appointment.appointmentDate}.</p></div>`;

const adminSubject = `Test: New appointment - ${appointment.customerName}`;
const adminHtml = `<div><p>Appointment details:</p><pre>${JSON.stringify(appointment, null, 2)}</pre></div>`;

const run = async () => {
  try {
    const result = await sendMultiChannelNotification({
      customerEmail: appointment.customerEmail,
      customerSubject,
      customerHtml,
      adminSubject,
      adminHtml,
    });
    console.log("Result:", result);
  } catch (err) {
    console.error("Error sending test notification:", err);
  }
};

run();
