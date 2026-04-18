const express = require("express");
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");

const router = express.Router();

router.get("/", getCategories);
router.post("/", addCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;