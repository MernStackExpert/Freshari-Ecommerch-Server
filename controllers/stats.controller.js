const { connectDB } = require("../config/db");

const getAdminStats = async (req, res) => {
  try {
    const db = await connectDB();

    const [
      totalProducts,
      totalOrders,
      totalAdmins,
      totalCategories,
      totalFaqs,
      totalBanners,
      revenueData
    ] = await Promise.all([
      db.collection("products").countDocuments(),
      db.collection("orders").countDocuments(),
      db.collection("admins").countDocuments(),
      db.collection("categories").countDocuments(),
      db.collection("faqs").countDocuments(),
      db.collection("banners").countDocuments(),
      db.collection("orders").aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
      ]).toArray()
    ]);

    const pendingOrders = await db.collection("orders").countDocuments({ orderStatus: "pending" });
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    res.status(200).json({
      totalProducts,
      totalOrders,
      totalAdmins,
      totalCategories,
      totalFaqs,
      totalBanners,
      totalRevenue,
      pendingOrders
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};

module.exports = { getAdminStats };