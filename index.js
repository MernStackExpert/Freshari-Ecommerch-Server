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

// api 
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);



app.get("/", (req, res) => {
  res.send("E-commerce server running 🚀");
});


app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});