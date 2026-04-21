const { connectDB, ObjectId } = require("../config/db");

const collection = async () => {
  const db = await connectDB();
  return db.collection("coupons");
};

const getAllCoupons = async (req, res) => {
  try {
    const couponCollection = await collection();
    const coupons = await couponCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount, minOrderAmount, usageLimit, expiryDate } = req.body;
    const couponCollection = await collection();

    const newCoupon = {
      code: code.toUpperCase(),
      discountType: discountType || "percentage", // 'percentage' অথবা 'fixed'
      discountAmount: parseFloat(discountAmount),
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      usedCount: 0,
      expiryDate: new Date(expiryDate),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await couponCollection.insertOne(newCoupon);
    res.status(201).json({ _id: result.insertedId, ...newCoupon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const couponCollection = await collection();
    
    const result = await couponCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Coupon deleted successfully" });
    } else {
      res.status(404).json({ message: "Coupon not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    const couponCollection = await collection();

    const updateData = { ...req.body };
    if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);
    if (updateData.code) updateData.code = updateData.code.toUpperCase();

    const result = await couponCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const couponCollection = await collection();

    const coupon = await couponCollection.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ message: "কুপনটি সঠিক নয় বা বর্তমানে সচল নেই।" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: "এই কুপনটির মেয়াদ শেষ হয়ে গেছে।" });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "এই কুপনটি ব্যবহারের সর্বোচ্চ সীমা অতিক্রম করেছে।" });
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `এই কুপনটি ব্যবহার করতে কমপক্ষে ৳${coupon.minOrderAmount} অর্ডার করতে হবে।` 
      });
    }

    res.status(200).json({
      success: true,
      discountAmount: coupon.discountAmount,
      discountType: coupon.discountType,
      message: "কুপন সফলভাবে প্রয়োগ করা হয়েছে!"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAllCoupons, 
  createCoupon, 
  deleteCoupon, 
  updateCoupon, 
  validateCoupon 
};