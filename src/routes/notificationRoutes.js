const express = require("express");
const { getMyNotifications, markNotificationRead } = require("../controllers/notificationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("owner"), getMyNotifications);
router.patch("/:id/read", protect, authorize("owner"), markNotificationRead);

module.exports = router;