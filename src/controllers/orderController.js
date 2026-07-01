const Order = require("../models/Order");
const Notification = require("../models/Notification");

// POST /api/orders (user only)
const placeOrder = async (req, res, next) => {
  try {
    const { shopEmail, shopName, items, paymentMethod } = req.body;

    if (!shopEmail || !items || !items.length || !paymentMethod) {
      return res.status(400).json({
        message: "Shop, cart items and payment method are required.",
      });
    }

    const total = items.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );

    const order = await Order.create({
      userEmail: req.user.email,
      userName: req.user.name,
      shopEmail: shopEmail.toLowerCase(),
      shopName,
      items,
      total,
      paymentMethod,
    });

    // Notify shop owner about new order
    await Notification.create({
      ownerEmail: shopEmail.toLowerCase(),
      message: `New order from ${req.user.name} - ${items.length} item(s), Total ₹${total}`,
      orderId: order._id,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/mine (user only)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      userEmail: req.user.email,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/shop (owner only)
const getShopOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      shopEmail: req.user.email,
    }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status (owner only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required.",
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        shopEmail: req.user.email,
      },
      {
        status,
      },
      {
        new: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // Notify the customer when order status changes
    await Notification.create({
      userEmail: order.userEmail,
      message: `Your order from ${order.shopName} has been ${status}.`,
      orderId: order._id,
    });

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getShopOrders,
  updateOrderStatus,
};