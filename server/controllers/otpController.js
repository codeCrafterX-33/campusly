import nodemailer from "nodemailer";
import pool from "../db.js";
import crypto from "crypto";

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

const transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
  const hashedOtp = hashOtp(otp);

  try {
    // Throttle: 60s cooldown
    const checkCooldown = await pool.query(
      `SELECT created_at FROM email_verifications WHERE email = $1`,
      [email]
    );

    if (
      checkCooldown.rows.length &&
      Date.now() - new Date(checkCooldown.rows[0].created_at).getTime() < 60000
    ) {
      return res.status(429).json({
        message: "Please wait 1 minute before requesting another OTP",
      });
    }

    // Insert or update OTP
    await pool.query(
      `INSERT INTO email_verifications (email, otp, expires_at, failed_attempts, created_at)
       VALUES ($1, $2, $3, 0, NOW())
       ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3, failed_attempts = 0, created_at = NOW()`,
      [email, hashedOtp, expiresAt]
    );

    // Send email
    await transporter.sendMail({
      from: `"Campusly" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Campusly OTP Code",
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  console.log(req.body);
  const { SchoolEmail, UserEmail, OTP } = req.body;
  const hashedOtp = hashOtp(OTP);

  try {
    const result = await pool.query(
      `SELECT * FROM email_verifications WHERE email = $1`,
      [SchoolEmail]
    );

    if (!result.rows.length) {
      return res.status(400).json({ message: "OTP not found" });
    }

    const { otp: storedOtp, expires_at, failed_attempts } = result.rows[0];

    // Max attempts check
    if (failed_attempts >= 5) {
      console.log("Too many failed attempts");
      return res.status(403).json({ message: "Too many failed attempts" });
    }

    if (new Date() > expires_at) {
      console.log("OTP expired");
      return res.status(400).json({ message: "OTP expired" });
    }

    if (hashedOtp !== storedOtp) {
      await pool.query(
        `UPDATE email_verifications SET failed_attempts = failed_attempts + 1 WHERE email = $1`,
        [SchoolEmail]
      );
      console.log("Invalid OTP");
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark as verified
    await pool.query(
      `UPDATE users SET studentstatusverified = TRUE WHERE email = $1`,
      [UserEmail]
    );

    // Remove OTP after success
    await pool.query(`DELETE FROM email_verifications WHERE email = $1`, [
      SchoolEmail,
    ]);

    res.status(200).json({ message: "Email verified" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
