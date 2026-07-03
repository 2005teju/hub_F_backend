const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    ownerEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true }, // owner's name
    phone: { type: String, required: true, trim: true },
    shopName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    // ── NEW: unique + uppercase, since a real GST number belongs to exactly one business ──
    gstId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    customerLicense: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shop", shopSchema);