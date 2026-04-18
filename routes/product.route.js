const express = require("express");
const {
  getAllProducts,
  singleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} =  require("../controllers/product.controller");

const router = express.Router();

// Public Routes
router.get("/", getAllProducts);
router.get("/:id", singleProduct);

// Admin Routes 
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;