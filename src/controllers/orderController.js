const Order = require("../models/Order");

// POST /api/orders  (user only)
const placeOrder = async (req, res, next) => {
  try {
    const { shopEmail, shopName, items, paymentMethod } = req.body;

    if (!shopEmail || !items || !items.length || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Shop, cart items and payment method are required." });
    }

    const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    const order = await Order.create({
      userEmail: req.user.email,
      userName: req.user.name,
      shopEmail: shopEmail.toLowerCase(),
      shopName,
      items,
      total,
      paymentMethod,
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/mine  (user only)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getMyOrders };
