const { connectDB, ObjectId } = require("../config/db");

const collection = async () => {
  const db = await connectDB();
  return db.collection("banners");
};

const createBanner = async (req, res) => {
  try {
    const bannerCollection = await collection();
    const { imageUrl, title, link ,isRight } = req.body;

    if (!imageUrl) {
      return res.status(400).send({ message: "Banner image URL is required" });
    }

    const newBanner = {
      imageUrl,
      title: title || "",
      link: link || "",
      isRight: isRight || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bannerCollection.insertOne(newBanner);
    res.status(201).send({ message: "Banner added successfully", bannerId: result.insertedId });
  } catch (error) {
    res.status(500).send({ message: "Failed to add banner", error: error.message });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const bannerCollection = await collection();
    const banners = await bannerCollection.find().sort({ createdAt: -1 }).toArray();
    res.send(banners);
  } catch (error) {
    res.status(500).send({ message: "Failed to fetch banners", error: error.message });
  }
};

const updateBanner = async (req, res) => {
  try {
    const bannerCollection = await collection();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid banner ID" });
    }

    const result = await bannerCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...req.body, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "Banner not found" });
    }

    res.send({ message: "Banner updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Failed to update banner", error: error.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const bannerCollection = await collection();
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid banner ID" });
    }

    const result = await bannerCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Banner not found" });
    }

    res.send({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Failed to delete banner", error: error.message });
  }
};

module.exports = {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner
};