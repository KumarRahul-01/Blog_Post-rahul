const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Hash password
const hashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Auth middleware
const AuthCheck = async (req, res, next) => {
  // Safely access req.body.token to avoid error if req.body is undefined
  let token =
    (req.body && req.body.token) ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Token is required for authentication",
    });
  }

  // If token starts with "Bearer ", remove it
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    console.log("Authenticated user:", req.user);
    next();
  } catch (err) {
    console.error("Token error:", err.message);
    return res.status(401).json({
      status: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { hashedPassword, comparePassword, AuthCheck };
