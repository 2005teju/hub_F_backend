const express = require("express");
const {
  saveShop,
  getMyShop,
  getShops,
  getPendingShops,
  verifyShop,
} = require("../controllers/shopController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Specific paths before the more general "/" GET to avoid ambiguity
router.get("/pending", protect, authorize("admin"), getPendingShops);
router.get("/me", protect, authorize("owner"), getMyShop);
router.get("/", getShops); // public: ?verified=true&location=text
router.post("/", protect, authorize("owner"), saveShop);
router.patch("/:email/verify", protect, authorize("admin"), verifyShop);

module.exports = router;
