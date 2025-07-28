const Comment = require("../model/Comment");

exports.addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const comment = await Comment.create({
      post: postId,
      content,
      user: req.user.userId,
    });
    res.status(201).json({ status: true, comment });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const comments = await Comment.aggregate([
      {
        $match: {
          post: new mongoose.Types.ObjectId(req.params.postId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.name": 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    res.status(200).json({ status: true, comments });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};
