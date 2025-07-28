const express = require("express");
const router = express.Router();
const postController = require("../controller/postController");
const { AuthCheck } = require("../middleware/authMiddleware");
const upload = require("../helper/uploadImage")

router.post("/create", AuthCheck, postController.createPost);
router.get("/all", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.put("/update/:id", AuthCheck, postController.updatePost);
router.delete("/delete/:id", AuthCheck, postController.deletePost);
router.post("/toggle-like/:id", AuthCheck, postController.toggleLikePost);


module.exports = router;
