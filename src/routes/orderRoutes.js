const express = require("express");
const { placeOrder, getMyOrders } = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, authorize("user"), placeOrder);
router.get("/mine", protect, authorize("user"), getMyOrders);

module.exports = router;
