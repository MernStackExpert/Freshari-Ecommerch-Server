const { connectDB, ObjectId } = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");

const collection = async () => {
  const db = await connectDB();
  return db.collection("admins");
};

const createAdminUser = async (req, res) => {
  try {
    const adminCollection = await collection();
    const { name, email, password, phone, img } = req.body;

    if (!name || !email || !password || !phone || !img) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const exists = await adminCollection.findOne({ email });
    if (exists) {
      return res.status(400).send({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      img,
      email,
      password: hashedPassword,
      phone,
      role: "user",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await adminCollection.insertOne(newUser);

    const html = `
      <div style="background-color: #f0fdf4; padding: 30px; font-family: sans-serif;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; color: #333; padding: 25px; border-radius: 10px; border: 1px solid #22c55e;">
          <h2 style="color: #16a34a; text-align: center;">Freshari - Admin Account Created</h2>
          <p>Hello <b>${name}</b>,</p>
          <p>Your admin account has been created on <b>Freshari</b>. Please wait for master approval.</p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="margin: 5px 0;"><b>Name:</b> ${name}</p>
            <p style="margin: 5px 0;"><b>Email:</b> ${email}</p>
            <p style="margin: 5px 0;"><b>Phone:</b> ${phone}</p>
          </div>
          <p style="font-size: 13px; color: #666; text-align: center;">Status: <b style="color: #e67e22;">Pending Approval</b></p>
        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Freshari 🍃" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Admin Access Request - Freshari",
        html,
      });
    } catch (err) {
      console.error(err.message);
    }

    res.status(201).send({ message: "Admin user created successfully", id: result.insertedId });
  } catch (error) {
    res.status(500).send({ message: "Failed to create admin", error: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const adminCollection = await collection();
    const { email, password } = req.body;

    const user = await adminCollection.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "Admin not found" });
    }

    if (user.status !== "active") {
      return res.status(403).send({ message: "Account is pending or inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.send({
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, role: user.role, img: user.img },
    });
  } catch (error) {
    res.status(500).send({ message: "Login failed", error: error.message });
  }
};

const updateAdminStatus = async (req, res) => {
  try {
    const adminCollection = await collection();
    const id = req.params.id;
    const { status, role } = req.body;

    const result = await adminCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...(status && { status }),
          ...(role && { role }),
          updatedAt: new Date(),
        },
      }
    );

    res.send({ message: "Status updated successfully", result });
  } catch (error) {
    res.status(500).send({ message: "Update failed", error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const adminCollection = await collection();
    const users = await adminCollection.find().sort({ createdAt: -1 }).toArray();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: "Error fetching admins" });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const adminCollection = await collection();
    const id = req.user.id;
    const { name, img, currentPassword, newPassword } = req.body;

    let updateData = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (img) updateData.img = img;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).send({ message: "Current password is required" });
      }

      const user = await adminCollection.findOne({ _id: new ObjectId(id) });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(401).send({ message: "Current password does not match" });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const result = await adminCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.send({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Profile update failed", error: error.message });
  }
};

const getAdminProfile = async (req, res) => {
  try {
    const adminCollection = await collection();
    const id = req.user.id; 

    const user = await adminCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } } 
    );

    if (!user) {
      return res.status(404).send({ message: "Admin not found" });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching profile", error: error.message });
  }
};

module.exports = { 
  createAdminUser, 
  adminLogin, 
  updateAdminStatus, 
  getAllAdmins, 
  updateAdminProfile,
  getAdminProfile
};