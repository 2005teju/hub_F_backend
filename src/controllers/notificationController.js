const Notification = require("../models/Notification");

// GET /api/notifications  (owner only) - this owner's notifications, newest first
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ ownerEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read  (owner only)
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ownerEmail: req.user.email },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications, markNotificationRead };