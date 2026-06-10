import 'dotenv/config';
import nodemailer from 'nodemailer';

const runDiagnostic = async () => {
  console.log('\n🔍 SMTP Diagnostic Report\n');
  console.log('📋 Configuration:');
  console.log(`  SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`  SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`  SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  console.log(`  ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`);

  try {
    console.log('\n🔗 Attempting SMTP Connection...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      logger: true, // Enable detailed logging
      debug: true,  // Enable debug output
    });

    // Verify connection
    console.log('\n📲 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email with full diagnostics
    console.log('\n📧 Sending diagnostic test email...');
    const testEmail = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL;
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: testEmail,
      subject: `🧪 SMTP Diagnostic Test - ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #0ea5e9; border-radius: 8px;">
          <h2>🧪 SMTP Diagnostic Test Email</h2>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
          <p><strong>To:</strong> ${testEmail}</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
        </div>
      `,
      text: `SMTP Diagnostic Test Email sent at ${new Date().toISOString()}`,
    });

    console.log('\n✅ Email Successfully Sent!\n');
    console.log('📬 Message Details:');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Recipient: ${testEmail}`);
    console.log(`  Status: ${info.response}`);
    console.log(`  Accepted: ${JSON.stringify(info.accepted)}`);
    console.log(`  Rejected: ${JSON.stringify(info.rejected)}`);
    console.log(`  Envelope From: ${info.envelope.from}`);
    console.log(`  Envelope To: ${JSON.stringify(info.envelope.to)}`);

    console.log('\n⚠️  Troubleshooting Tips:');
    console.log('  1. Check SPAM/PROMOTIONS/UPDATES folder in Gmail');
    console.log('  2. Search Gmail for: "from:' + process.env.SMTP_USER + '"');
    console.log(`  3. Check mail forwarding rules in Gmail settings`);
    console.log('  4. Verify app password is still valid (if 2FA enabled)');
    console.log(`  5. Check Gmail Security: https://myaccount.google.com/security`);
    console.log('  6. Look for "Less secure app access" blocks');
    console.log(`  7. Check message ID in Gmail: ${info.messageId}`);

    await transporter.close();
  } catch (error) {
    console.error('\n❌ SMTP Error Occurred:\n');
    console.error(`  Error: ${error.message}`);
    console.error(`  Code: ${error.code}`);
    console.error(`  Command: ${error.command}`);
    
    console.log('\n🔧 Common Solutions:');
    console.log('  • Verify SMTP_USER and SMTP_PASS are correct');
    console.log('  • If using Gmail 2FA, ensure you\'re using an App Password, not your regular password');
    console.log('  • Check: https://myaccount.google.com/apppasswords');
    console.log('  • Ensure Less Secure Apps access is NOT blocked');
    console.log('  • Restart the server after fixing environment variables');
  }
};

runDiagnostic();
