const express = require("express");
const { getAllFaqs, createFaq, updateFaq, deleteFaq } = require("../controllers/faqs.controller");
const router = express.Router();

router.get("/", getAllFaqs);
router.post("/", createFaq);
router.patch("/:id", updateFaq);
router.delete("/:id", deleteFaq);

module.exports = router;