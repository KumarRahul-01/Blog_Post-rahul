const Post = require("../model/Post");
const mongoose = require("mongoose");

exports.createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await Post.create({
      title,
      content,
      category: new mongoose.Types.ObjectId(category),
      author: new mongoose.Types.ObjectId(req.user.userId),
      tags: tags ? tags.split(",") : [],
    });

    res.status(201).json({ status: true, post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      { $unwind: "$authorInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          title: 1,
          content: 1,
          tags: 1,
          likes: 1,
          createdAt: 1,
          author: {
            _id: "$authorInfo._id",
            name: "$authorInfo.name",
            email: "$authorInfo.email",
          },
          category: {
            _id: "$categoryInfo._id",
            name: "$categoryInfo.name",
          },
        },
      },
    ]);

    res.status(200).json({ status: true, total: posts.length, posts });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const posts = await Post.aggregate([
      { $match: { _id: postId } },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      { $unwind: "$authorInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          title: 1,
          content: 1,
          tags: 1,
          likes: 1,
          createdAt: 1,
          author: {
            _id: "$authorInfo._id",
            name: "$authorInfo.name",
            email: "$authorInfo.email",
          },
          category: {
            _id: "$categoryInfo._id",
            name: "$categoryInfo.name",
          },
        },
      },
    ]);

    if (posts.length === 0)
      return res.status(404).json({ status: false, message: "Post not found" });

    res.status(200).json({ status: true, post: posts[0] });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!post)
      return res
        .status(404)
        .json({ status: false, message: "Post not found or not authorized" });

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags ? tags.split(",") : post.tags;

    await post.save();
    res.status(200).json({ status: true, post });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user.userId,
    });

    if (!post)
      return res
        .status(404)
        .json({ status: false, message: "Post not found or not authorized" });

    res
      .status(200)
      .json({ status: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getPostsSortedByLikes = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      { $unwind: "$authorInfo" },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: "$categoryInfo" },
      { $sort: { likes: -1 } },
      {
        $project: {
          title: 1,
          content: 1,
          tags: 1,
          likes: 1,
          createdAt: 1,
          author: {
            _id: "$authorInfo._id",
            name: "$authorInfo.name",
            email: "$authorInfo.email",
          },
          category: {
            _id: "$categoryInfo._id",
            name: "$categoryInfo.name",
          },
        },
      },
    ]);

    res.status(200).json({ status: true, posts });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ status: false, message: "Post not found" });

    const userId = req.user.userId;
    const hasLiked = post.likedBy.includes(userId);

    if (hasLiked) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter((id) => id.toString() !== userId);
    } else {
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();

    res.status(200).json({
      status: true,
      liked: !hasLiked,
      likes: post.likes,
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
