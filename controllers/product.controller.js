const { connectDB, ObjectId } = require("../config/db");

const collection = async () => {
  const db = await connectDB();
  return db.collection("products");
};

const getAllProducts = async (req, res) => {
  try {
    const productCollection = await collection();
    const query = {};

    // ১. ক্যাটাগরি ফিল্টার (Nested slug অনুযায়ী)
    if (req.query.category) {
      query["category.slug"] = req.query.category;
    }

    // ২. সার্চ ফিল্টার
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    // ৩. প্রাইস রেঞ্জ ফিল্টার (pricing.price এর ভেতর থেকে)
    if (req.query.minPrice || req.query.maxPrice) {
      query["pricing.price"] = {};
      if (req.query.minPrice) query["pricing.price"].$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query["pricing.price"].$lte = Number(req.query.maxPrice);
    }

    // ৪. রেটিং ফিল্টার (social.rating এর ভেতর থেকে)
    if (req.query.rating) {
      query["social.rating"] = { $gte: Number(req.query.rating) };
    }

    // ৫. স্ট্যাটাস ফিল্টার (যেমন Today Special বা Featured)
    if (req.query.isTodaySpecial) {
      query["status.isTodaySpecial"] = req.query.isTodaySpecial === "true";
    }

    // প্যাগিনেশন
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalProducts = await productCollection.countDocuments(query);

    // সর্টিং লজিক
    let sort = { createdAt: -1 }; // বাই ডিফল্ট নতুনগুলো আগে দেখাবে
    if (req.query.sortBy) {
      const order = req.query.order === "desc" ? -1 : 1;
      // যদি sortBy 'price' হয় তবে 'pricing.price' এ সর্ট করবে
      const sortField = req.query.sortBy === "price" ? "pricing.price" : req.query.sortBy;
      sort = { [sortField]: order };
    }

    const products = await productCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch products", error });
  }
};

const singleProduct = async (req, res) => {
  try {
    const productCollection = await collection();
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid product id" });
    }
    const product = await productCollection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.send(product);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch product",
      error,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const productCollection = await collection();

    const product = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await productCollection.insertOne(product);

    res.status(201).send(result);
  } catch (error) {
    res.status(500).send({ message: "Failed to create product", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productCollection = await collection();
    const id = req.params.id;

    const updatedData = { ...req.body };

    delete updatedData._id;

    const result = await productCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updatedData, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Product Not Found" });
    }

    res.send({ message: "Product updated successfully", result });
  } catch (error) {
    res.status(500).send({ 
      message: "Failed to update product", 
      error: error.message 
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productCollection = await collection();
    const id = req.params.id;

    const result = await productCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Product Not Found" });
    }

    res.send({ message: "Product deleted successfully", result });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete product", error });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  singleProduct,
};