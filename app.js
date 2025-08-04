const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const dotenv = require("dotenv");
const connectDB = require("./app/config/db");
const session = require("express-session");

dotenv.config();
connectDB();

const app = express();

// Parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup session and flash messages
app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);

// Static folders
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./app/router/authRoutes");
const userRoutes = require("./app/router/userRoutes");
const categoryRoutes = require("./app/router/categoryRoutes");
const postRoutes = require("./app/router/postRoutes");
const commentRoutes = require("./app/router/commentRoutes");

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Blog API...");
});

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
