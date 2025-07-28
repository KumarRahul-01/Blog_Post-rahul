const transporter = require("../config/emailConfig");
const otpVerifyModel = require("../model/OtpModel");

// Generic email sending function
const sendEmail = async (to, subject, html) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};

// OTP email function using sendEmail
const sendEmailVerificationOTP = async (req, user) => {
  const otp = Math.floor(1000 + Math.random() * 9000);

  // Save OTP in DB
  await new otpVerifyModel({ userId: user._id, otp }).save();

  const html = `
    <p>Dear ${user.name},</p>
    <p>Thank you for signing up with our website. To complete your registration, please verify your email address by entering the following one-time password (OTP)</p>
    <h2>OTP: ${otp}</h2>
    <p>This OTP is valid for 15 minutes. If you didn't request this OTP, please ignore this email.</p>`;

  await sendEmail(user.email, "OTP - Verify your account", html);

  return otp;
};

module.exports = { sendEmail, sendEmailVerificationOTP };
