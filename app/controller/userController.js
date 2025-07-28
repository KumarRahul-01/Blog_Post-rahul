const User = require("../model/User");

class UserController {
  getProfile = async (req, res) => {
    try {
      const userId = req.user.userId || req.user._id || req.user.id;
      if (!userId) {
        return res.status(400).json({ error: "User ID not found in request" });
      }

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
  updateProfile = async (req, res) => {
    try {
      const { name } = req.body;
      const profilePicture = req.file?.path;

      const updateData = { name };
      if (profilePicture) updateData.profilePicture = profilePicture;

      const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
        new: true,
      }).select("-password");

      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

module.exports = new UserController();
