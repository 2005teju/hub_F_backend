const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    ownerEmail: {
      type: String,
      lowercase: true,
      index: true,
    },

    userEmail: {
      type: String,
      lowercase: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);