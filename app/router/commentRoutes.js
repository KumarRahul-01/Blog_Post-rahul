const express = require("express");
const router = express.Router();
const commentController = require("../controller/commentController");
const { AuthCheck } = require("../middleware/authMiddleware");

router.post("/add", AuthCheck, commentController.addComment);
router.get("/:postId", commentController.getCommentsByPost);

module.exports = router;
