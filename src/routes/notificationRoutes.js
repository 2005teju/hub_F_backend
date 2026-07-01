const express = require("express");
const {
  getMyNotifications,
  markNotificationRead,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/auth");

const router = express.Router();

// Accessible by both users and owners
router.get("/", protect, getMyNotifications);
router.patch("/:id/read", protect, markNotificationRead);

module.exports = router;