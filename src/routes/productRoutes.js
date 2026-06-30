const express = require("express");
const {
  addProduct,
  getMyProducts,
  getProductsByShop,
  getAllProducts,
  deleteProduct,
  updateQuality,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllProducts);
router.get("/mine", protect, authorize("owner"), getMyProducts);
router.get("/shop/:email", getProductsByShop); // public: browse a shop's products
router.post("/", protect, authorize("owner"), addProduct);
router.patch("/:id/quality", protect, authorize("admin"), updateQuality);
router.delete("/:id", protect, authorize("owner", "admin"), deleteProduct);

module.exports = router;
