import nodemailer from "nodemailer";

// Initialize the SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER || "kritin006@gmail.com",
    pass: process.env.SMTP_PASS || "dyaqwsykamropzza",
  },
});

/**
 * Sends an OTP email to the user.
 * @param to The recipient's email address
 * @param otp The 6-digit OTP code
 */
export async function sendOtpEmail(to: string, otp: string): Promise<boolean> {
  // Always log the OTP to console for debugging and testing fallback
  console.log(`\n======================================================`);
  console.log(`[EMAIL DEV FALLBACK] OTP Code for ${to} is: ${otp}`);
  console.log(`======================================================\n`);

  try {
    const mailOptions = {
      from: `"DPS Damanjodi ERP" <${process.env.SMTP_USER || "kritin006@gmail.com"}>`,
      to,
      subject: "DPS Damanjodi Portal - Verification Code",
      text: `Your security verification code (OTP) is: ${otp}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #0b7a3b; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #0b7a3b; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">Delhi Public School, Damanjodi</h2>
            <span style="color: #666; font-size: 12px;">Official Portal & ERP Workspace</span>
          </div>
          
          <p style="font-size: 15px; color: #333; line-height: 1.5;">Hello,</p>
          <p style="font-size: 15px; color: #333; line-height: 1.5;">You have requested a security verification code to authorize access or update your credentials for your portal workspace account.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #166534; font-weight: bold; text-uppercase: true; letter-spacing: 1px;">Your OTP Verification Code</p>
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0b7a3b; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="font-size: 14px; color: #dc2626; font-weight: bold;">Note: This verification code is valid for 15 minutes. Do not share this code with anyone.</p>
          
          <p style="font-size: 14px; color: #555; line-height: 1.5; margin-top: 25px;">If you did not request this verification code, you can safely ignore this email. Your password remains unchanged.</p>
          
          <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 15px; font-size: 11px; color: #888; text-align: center;">
            This is an automated security notification. Please do not reply directly to this email.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email successfully sent to ${to}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[SMTP] Failed to send email to ${to}:`, error);
    // Return true since we logged it to the console as a development/test fallback
    return false;
  }
}
