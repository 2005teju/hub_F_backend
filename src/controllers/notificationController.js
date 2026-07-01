const Notification = require("../models/Notification");

// GET /api/notifications
// Owner -> owner notifications
// User -> user notifications
const getMyNotifications = async (req, res, next) => {
  try {
    let notifications;

    if (req.user.role === "owner") {
      notifications = await Notification.find({
        ownerEmail: req.user.email,
      }).sort({ createdAt: -1 });
    } else {
      notifications = await Notification.find({
        userEmail: req.user.email,
      }).sort({ createdAt: -1 });
    }

    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
const markNotificationRead = async (req, res, next) => {
  try {
    let notification;

    if (req.user.role === "owner") {
      notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          ownerEmail: req.user.email,
        },
        { read: true },
        { new: true }
      );
    } else {
      notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          userEmail: req.user.email,
        },
        { read: true },
        { new: true }
      );
    }

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
};