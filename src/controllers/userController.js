const User = require("../models/User");

// GET /api/users  (admin only)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:email/approve  (admin only) - approves a shop-owner account
const approveOwner = async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "owner") {
      return res.status(400).json({ message: "Only shop-owner accounts can be approved here." });
    }

    user.approved = true;
    await user.save();

    res.json({ message: "Owner approved successfully", user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, approveOwner };
