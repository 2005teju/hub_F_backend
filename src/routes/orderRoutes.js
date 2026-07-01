const express = require("express");
const { placeOrder, getMyOrders, getShopOrders, updateOrderStatus } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("user"), placeOrder);
router.get("/mine", protect, authorize("user"), getMyOrders);
router.get("/shop", protect, authorize("owner"), getShopOrders);
router.patch("/:id/status", protect, authorize("owner"), updateOrderStatus);

module.exports = router;