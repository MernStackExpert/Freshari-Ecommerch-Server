const express = require("express");
const router = express.Router();
const { 
  getAllCoupons, 
  createCoupon, 
  deleteCoupon, 
  updateCoupon, 
  validateCoupon 
} = require("../controllers/coupon.controller");

// Admin Routes
router.post("/add", createCoupon); // createCoupon যেন undefined না হয়
router.get("/all", getAllCoupons);
router.delete("/delete/:id", deleteCoupon);
router.put("/update/:id", updateCoupon);

// Client Route
router.post("/validate", validateCoupon);

module.exports = router;