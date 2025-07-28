const express = require("express");
const authController = require("../controller/authController");
const { AuthCheck } = require("../middleware/authMiddleware"); // If you have this
const upload = require("../helper/uploadImage"); // If you have this

const router = express.Router();

// Public routes
router.post("/register", upload.single("profilePicture"), authController.registerUser);

router.post("/verify", authController.verify);
router.post("/login", authController.loginUser);



router.get("/dashboard", AuthCheck, authController.dashboard);



module.exports = router;
