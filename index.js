// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// routes

// products
const productRoutes = require("./routes/product.route.js");

// orders
const orderRoutes = require("./routes/orders.route.js");

// category 
const categoriesRoutes = require("./routes/categories.route");

// banners 
const bannersRoutes = require("./routes/banners.route");

// faqs 
const faqRoutes = require("./routes/faqs.route");

// create admin 
const adminsRoutes = require("./routes/admins.route");

// admin stats 
const statsRoutes = require("./routes/stats.route");

// copuon code 
const couponRoutes = require("./routes/coupon.routes.js");

// api 
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/admins", adminsRoutes);
app.use("/api/admin-stats", statsRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/", (req, res) => {
  res.send("E-commerce server running 🚀");
});


app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});