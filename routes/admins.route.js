const express = require("express");
const { 
  createAdminUser, 
  adminLogin, 
  updateAdminStatus, 
  getAllAdmins, 
  updateAdminProfile,
  getAdminProfile 
} = require("../controllers/admins.controller");
const { verifyAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", createAdminUser);
router.post("/login", adminLogin);

// Protected Routes
router.get("/all", verifyAdmin, getAllAdmins);
router.get("/profile", verifyAdmin, getAdminProfile);
router.patch("/profile-update", verifyAdmin, updateAdminProfile);
router.patch("/status/:id", verifyAdmin, updateAdminStatus);

module.exports = router;