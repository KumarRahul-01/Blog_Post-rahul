const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const { AuthCheck } = require("../middleware/authMiddleware");

router.post("/add", AuthCheck, categoryController.createCategory);
router.get("/", categoryController.getAllCategories);

module.exports = router;
