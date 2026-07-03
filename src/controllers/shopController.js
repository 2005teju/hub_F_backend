const Shop = require("../models/Shop");

// POST /api/shops  (owner only) - create or update own shop details.
// This doubles as submitting/re-submitting a "shop verification request".
const saveShop = async (req, res, next) => {
  try {
    const ownerEmail = req.user.email;
    const { name, phone, shopName, address, gstId, customerLicense } = req.body;

    if (!name || !phone || !shopName || !address || !gstId || !customerLicense) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    // ── NEW: normalize GST ID the same way the schema does ──
    const normalizedGstId = gstId.trim().toUpperCase();

    // ── NEW: proactively check no *other* shop already owns this GST ID ──
    const gstOwner = await Shop.findOne({ gstId: normalizedGstId });
    if (gstOwner && gstOwner.ownerEmail !== ownerEmail) {
      return res.status(400).json({
        message: "This GST ID is already registered to another shop.",
      });
    }

    let shop = await Shop.findOne({ ownerEmail });

    if (shop) {
      shop.name = name.trim();
      shop.phone = phone.trim();
      shop.shopName = shopName.trim();
      shop.address = address.trim();
      shop.gstId = normalizedGstId;
      shop.customerLicense = customerLicense.trim();
      // verified flag is intentionally preserved on re-save
      await shop.save();
    } else {
      shop = await Shop.create({
        ownerEmail,
        name: name.trim(),
        phone: phone.trim(),
        shopName: shopName.trim(),
        address: address.trim(),
        gstId: normalizedGstId,
        customerLicense: customerLicense.trim(),
        verified: false,
      });
    }

    res.json({
      message: "Shop details saved successfully, waiting for admin verification.",
      shop,
    });
  } catch (err) {
    // ── NEW: safety net for the schema-level unique constraint ──
    // Covers the rare race condition where two requests for the same
    // GST ID both pass the findOne() check before either save()/create() finishes.
    if (err.code === 11000 && err.keyPattern) {
      if (err.keyPattern.gstId) {
        return res.status(400).json({
          message: "This GST ID is already registered to another shop.",
        });
      }
      if (err.keyPattern.ownerEmail) {
        return res.status(400).json({
          message: "A shop is already registered for this account.",
        });
      }
    }
    next(err);
  }
};

// GET /api/shops/me  (owner only)
const getMyShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ ownerEmail: req.user.email });
    res.json({ shop: shop || null });
  } catch (err) {
    next(err);
  }
};

// GET /api/shops?verified=true&location=text  (public - used by User dashboard)
const getShops = async (req, res, next) => {
  try {
    const { verified, location } = req.query;
    const filter = {};
    if (verified !== undefined) filter.verified = verified === "true";

    let shops = await Shop.find(filter).sort({ createdAt: -1 });

    if (location) {
      const term = location.toLowerCase();
      shops = shops.filter(
        (s) =>
          s.shopName.toLowerCase().includes(term) || s.address.toLowerCase().includes(term)
      );
    }

    res.json(shops);
  } catch (err) {
    next(err);
  }
};

// GET /api/shops/pending  (admin only) - shop verification requests awaiting review
const getPendingShops = async (req, res, next) => {
  try {
    const shops = await Shop.find({ verified: false }).sort({ createdAt: -1 });
    res.json(shops);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/shops/:email/verify  (admin only)
const verifyShop = async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const shop = await Shop.findOne({ ownerEmail: email });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    shop.verified = true;
    await shop.save();

    res.json({ message: "Shop verified successfully", shop });
  } catch (err) {
    next(err);
  }
};

module.exports = { saveShop, getMyShop, getShops, getPendingShops, verifyShop };