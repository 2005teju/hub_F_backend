const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    ownerEmail: { type: String, required: true, lowercase: true, trim: true },
    ownerName: { type: String, default: "" },
    shopName: { type: String, default: "" },

    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    quantity: { type: String, required: true }, // e.g. "1 Kg", "2 Liters"
    category: { type: String, required: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    delivery: { type: Boolean, default: false },

    quality: {
      type: String,
      enum: ["Pending", "Good", "Average", "Poor"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
