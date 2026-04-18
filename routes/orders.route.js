const express = require("express");
const {
  getOrders,
  createOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orders.controller");

const router = express.Router();

router.get("/", getOrders);
router.post("/", createOrders);
router.patch("/:id", updateOrder);
router.delete("/:id", deleteOrder);

module.exports = router;