const express = require("express");
const { createMessage, getMessages } = require("../controllers/messageController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", createMessage);
router.get("/", protect, authorize("admin"), getMessages);

module.exports = router;
