const express = require("express");
const {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner
} = require("../controllers/banner.controller");

const router = express.Router();

router.get("/", getAllBanners);
router.post("/", createBanner);
router.patch("/:id", updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;