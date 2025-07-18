import { Resend } from "resend";
import crypto from "crypto";
import client from "../db.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  try {
    // Save OTP to DB
    await client.query(
      `INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3`,
      [email, otp, expiresAt]
    );

    // Send email with Resend
    const { data, error } = await resend.emails.send({
      from: "Campusly <onboarding@resend.dev>", // default domain for testing
      to: email,
      subject: "Campusly OTP Code",
      text: `Your OTP code is ${otp}. It expires in 5 minutes.`,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    console.log("Email sent:", data);
    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const result = await client.query(
    `SELECT * FROM email_verifications WHERE email = $1`,
    [email]
  );

  if (!result.rows.length) {
    return res.status(400).json({ message: "OTP not found" });
  }

  const { otp: storedOtp, expires_at } = result.rows[0];

  if (otp !== storedOtp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (new Date() > expires_at) {
    return res.status(400).json({ message: "OTP expired" });
  }

  // Optional: mark user as verified
  await client.query(
    `UPDATE users SET studentstatusverified = TRUE WHERE email = $1`,
    [email]
  );

  res.status(200).json({ message: "Email verified" });
};
