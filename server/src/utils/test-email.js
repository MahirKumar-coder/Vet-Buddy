import dotenv from "dotenv";
dotenv.config();

import { sendEmail } from "../services/notificationService.js";

async function test() {
  console.log("📨 Attempting to send test email...");
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? "PRESENT (" + process.env.SMTP_PASS.length + " chars)" : "MISSING"}`);
  console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);

  const res = await sendEmail({
    to: process.env.ADMIN_EMAIL || "geminiprostu5@gmail.com",
    subject: "🧪 Diagnostic Test: Vet Buddy SMTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0ea5e9; text-align: center;">Vet Buddy Patna</h2>
        <h3 style="color: #16a34a; text-align: center; border-bottom: 2px solid #38bdf8; padding-bottom: 8px;">SMTP Diagnostic Success!</h3>
        <p>Hi Dr. Prince,</p>
        <p>If you are reading this email in your inbox, it means your **Google App Password** and **Nodemailer SMTP** options are **100% correctly configured** and working at a production level! 🎉</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #16a34a;">
          <p style="margin: 0; font-size: 14px; color: #475569;">
            <strong>SMTP User:</strong> ${process.env.SMTP_USER}<br/>
            <strong>Environment:</strong> Production / Live
          </p>
        </div>
        <p>Any future customer bookings or shop orders will successfully send real-time alerts directly here.</p>
        <p style="margin-top: 25px; border-top: 1px solid #e0e0e0; padding-top: 15px; font-size: 12px; color: #64748b; text-align: center;">
          Vet Buddy Clinic, Patna, Bihar.
        </p>
      </div>
    `,
  });

  console.log("\n📬 Final Result:", res);
  process.exit(0);
}

test();
