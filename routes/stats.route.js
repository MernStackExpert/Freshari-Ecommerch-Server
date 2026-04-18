const express = require("express");
const { getAdminStats } = require("../controllers/stats.controller");
const { verifyAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", verifyAdmin, getAdminStats);

module.exports = router;