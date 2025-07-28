const express = require('express');
const router = express.Router();
const UserController = require('../controller/userController');
const { AuthCheck } = require('../middleware/authMiddleware'); // ✅ Destructure
const upload = require('../helper/uploadImage');

router.get('/profile', AuthCheck, UserController.getProfile);
router.put('/profile', AuthCheck, upload.single('profilePicture'), UserController.updateProfile);

module.exports = router;
