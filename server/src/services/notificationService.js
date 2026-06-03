import nodemailer from "nodemailer";

// Initialize Nodemailer Transporter (production only - requires SMTP env vars)
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration missing. Set SMTP_HOST, SMTP_USER and SMTP_PASS in environment variables for production.");
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

// Twilio SMS config removed

/**
 * Send an Email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} options.text - plain text body fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = getTransporter();

    const from = process.env.EMAIL_FROM || '"Vet Buddy Patna" <noreply@vetbuddy.com>';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // clean html to text fallback
      html,
    });

    // Log SMTP delivery details
    console.log(`✅ Email send result for ${to}: ${info.messageId}`);
    if (info.envelope) console.log("Envelope:", info.envelope);
    if (info.accepted) console.log("Accepted:", info.accepted);
    if (info.rejected) console.log("Rejected:", info.rejected);
    if (info.response) console.log("Response:", info.response);

    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification to both customer and admin
 * @param {Object} options
 * @param {string} options.customerEmail
 * @param {string} options.customerSubject
 * @param {string} options.customerHtml
 * @param {string} options.adminSubject
 * @param {string} options.adminHtml
 */
export const sendMultiChannelNotification = async ({
  customerEmail,
  customerSubject,
  customerHtml,
  adminSubject,
  adminHtml,
  adminEmail: overrideAdminEmail, // optional override (e.g., doctor's email)
}) => {
  const adminEmail = overrideAdminEmail || process.env.ADMIN_EMAIL || "admin@vetbuddy.com";

  const promises = [];

  // Send to Customer
  if (customerEmail && customerHtml) {
    promises.push(sendEmail({ to: customerEmail, subject: customerSubject, html: customerHtml }));
  }

  // Send to Admin/Doctor
  if (adminEmail && adminHtml) {
    promises.push(sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml }));
  }

  return Promise.all(promises);
};

export default {
  sendEmail,
  sendMultiChannelNotification,
};
