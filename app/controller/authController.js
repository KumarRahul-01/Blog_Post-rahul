const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../model/User");
const EmailVerifyModel = require("../model/OtpModel");
const {
  hashedPassword,
  comparePassword,
} = require("../middleware/authMiddleware");
const { sendEmailVerificationOTP } = require("../utils/email");
const transporter = require("../config/emailConfig");

class ApiController {
  // Register a new user
  async registerUser(req, res) {
    try {
      const { name, email, password } = req.body;
      const profilePicture = req.file ? req.file.filename : null;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ status: false, message: "All fields are required" });
      }

      const existUser = await UserModel.findOne({ email });
      if (existUser) {
        return res
          .status(400)
          .json({ status: false, message: "User already exists" });
      }

      const hashedPas = await hashedPassword(password);
      const newUser = new UserModel({
        name,
        email,
        password: hashedPas,
        profilePicture,
      });

      const user = await newUser.save();
      sendEmailVerificationOTP(req, user);

      return res.status(201).json({
        status: true,
        message:
          "User registered successfully. OTP sent to your email. Please verify your email.",
        data: user,
      });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  }

  // Verify email
  async verify(req, res) {
    try {
      const { otp } = req.body;
      if (!otp) {
        return res
          .status(400)
          .json({ status: false, message: "OTP is required" });
      }

      const otpRecord = await EmailVerifyModel.findOne({ otp });
      if (!otpRecord) {
        return res.status(400).json({ status: false, message: "Invalid OTP" });
      }

      const user = await UserModel.findById(otpRecord.userId);
      if (!user) {
        return res
          .status(404)
          .json({ status: false, message: "User not found" });
      }

      if (user.isVerified) {
        return res
          .status(400)
          .json({ status: false, message: "Email already verified" });
      }

      const expiry = new Date(otpRecord.createdAt.getTime() + 15 * 60 * 1000);
      if (new Date() > expiry) {
        await sendEmailVerificationOTP(req, user);
        return res
          .status(400)
          .json({ status: false, message: "OTP expired. New OTP sent." });
      }

      user.isVerified = true;
      await user.save();
      await EmailVerifyModel.deleteMany({ userId: user._id });

      return res
        .status(200)
        .json({ status: true, message: "Email verified successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ status: false, message: "Verification failed" });
    }
  }

  // Login user
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ status: false, message: "Email and password are required" });
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: "User not found" });
      }

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid password" });
      }

      const token = jwt.sign(
        { userId: user._id, name: user.name, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        status: true,
        message: "Login successful",
        data: { id: user._id, name: user.name, email: user.email },
        token,
      });
    } catch (err) {
      return res.status(500).json({ status: false, message: err.message });
    }
  }

  // User dashboard
  async dashboard(req, res) {
    return res.status(200).json({
      status: true,
      message: "Welcome to user dashboard",
      data: req.user,
    });
  }
}

module.exports = new ApiController();
