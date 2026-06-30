const Product = require("../models/Product");
const Shop = require("../models/Shop");

// POST /api/products  (owner only) - requires the owner's shop to be verified
const addProduct = async (req, res, next) => {
  try {
    const ownerEmail = req.user.email;
    const shop = await Shop.findOne({ ownerEmail });

    if (!shop || !shop.verified) {
      return res
        .status(403)
        .json({ message: "Your shop must be verified by admin before adding products." });
    }

    const { name, price, quantity, category, image, description, delivery } = req.body;

    if (!name || !price || !quantity || !category) {
      return res
        .status(400)
        .json({ message: "Please enter product name, price, quantity and category." });
    }

    const product = await Product.create({
      ownerEmail,
      ownerName: req.user.name,
      shopName: shop.shopName,
      name,
      price,
      quantity,
      category,
      image: image || "",
      description: description || "",
      delivery: !!delivery,
      quality: "Pending",
    });

    res.status(201).json({ message: "Product added successfully.", product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/mine  (owner only)
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ ownerEmail: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/shop/:email  (public - used by User dashboard to browse a shop)
const getProductsByShop = async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const products = await Product.find({ ownerEmail: email }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET /api/products  (admin only) - all products across all shops
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id  (owner who owns it, or admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.role === "owner" && product.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: "You can only delete your own products." });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id/quality  (admin only)
const updateQuality = async (req, res, next) => {
  try {
    const { quality } = req.body;
    const allowed = ["Pending", "Good", "Average", "Poor"];

    if (!allowed.includes(quality)) {
      return res.status(400).json({ message: "Invalid quality value." });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.quality = quality;
    await product.save();

    res.json({ message: "Quality updated", product });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addProduct,
  getMyProducts,
  getProductsByShop,
  getAllProducts,
  deleteProduct,
  updateQuality,
};
