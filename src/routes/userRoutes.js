const express = require("express");
const { getUsers, approveOwner } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);
router.patch("/:email/approve", protect, authorize("admin"), approveOwner);

module.exports = router;
