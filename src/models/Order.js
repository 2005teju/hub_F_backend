const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    price: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true },
    userName: { type: String, default: "" },

    shopEmail: { type: String, required: true, lowercase: true },
    shopName: { type: String, default: "" },

    items: [orderItemSchema],
    total: { type: Number, required: true },

    paymentMethod: { type: String, enum: ["card", "upi"], required: true },
    status: { type: String, default: "Placed" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
