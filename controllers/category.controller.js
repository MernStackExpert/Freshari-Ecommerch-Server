const { connectDB, ObjectId } = require("../config/db");

const collection = async () => {
  const db = await connectDB();
  return db.collection("categories");
};

const getCategories = async (req, res) => {
  try {
    const categoryCollection = await collection();
    const categories = await categoryCollection.find().toArray();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, icon , img , top} = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const categoryCollection = await collection();
    
    const newCategory = {
      name,
      slug: name.toLowerCase().replace(/ /g, '-'),
      icon: icon || null,
      img: img || null,
      top,
      createdAt: new Date()
    };

    const result = await categoryCollection.insertOne(newCategory);
    res.status(201).json({ 
      message: "Category added successfully", 
      insertedId: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding category", error });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, icon } = req.body;
    
    const categoryCollection = await collection();
    
    const updateDoc = {
      $set: {
        ...(name && { name, slug: name.toLowerCase().replace(/ /g, '-') }),
        ...(icon && { icon }),
        updatedAt: new Date()
      }
    };

    const result = await categoryCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating category", error });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const categoryCollection = await collection();
    
    const result = await categoryCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
};

module.exports = { getCategories, addCategory, updateCategory, deleteCategory };