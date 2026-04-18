const { connectDB , ObjectId } = require("../config/db");

const collection = async () => {
  const db = await connectDB();
  return db.collection("faqs");
};

const getAllFaqs = async (req, res) => {
  try {
    const faqCollection = await collection();
    const faqs = await faqCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createFaq = async (req, res) => {
  try {
    const { question, ans } = req.body;
    const faqCollection = await collection();
    
    const newFaq = {
      question,
      ans,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await faqCollection.insertOne(newFaq);
    res.status(201).json({ _id: result.insertedId, ...newFaq });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const id = req.params.id;
    const faqCollection = await collection();
    
    const result = await faqCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "FAQ deleted successfully" });
    } else {
      res.status(404).json({ message: "FAQ not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFaq = async (req, res) => {
  try {
    const id = req.params.id;
    const faqCollection = await collection();

    const result = await faqCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...req.body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(200).json({ message: "FAQ updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllFaqs ,createFaq , deleteFaq , updateFaq}