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
      <div style="background-color: #f8fafc; padding: 40px 15px; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(15,23,42,0.05);">
          
          <div style="background-color: #0f172a; padding: 45px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
              ARSHE<span style="color: #f97316;">MART.</span>
            </h1>
            <p style="margin: 10px 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Admin Access Request</p>
          </div>

          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 15px; color: #0f172a; font-size: 22px; font-weight: 900;">হ্যালো, ${name}</h2>
            <p style="margin: 0 0 30px; color: #64748b; font-size: 15px; font-weight: 500;">আপনার অ্যাডমিন অ্যাকাউন্টটি সফলভাবে তৈরি করা হয়েছে। তবে প্যানেলে অ্যাক্সেস পেতে মাস্টার অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।</p>

            <div style="background-color: #f8fafc; border-left: 4px solid #f97316; border-radius: 0 16px 16px 0; padding: 25px; margin-bottom: 35px;">
              <h3 style="margin: 0 0 15px; color: #0f172a; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">অ্যাকাউন্টের বিবরণ:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px; width: 30%;">Name:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 800; font-size: 14px;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 800; font-size: 14px;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Password:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 800; font-size: 14px;">${password}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Phone:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 800; font-size: 14px;">${phone}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <span style="display: inline-block; background-color: #fff7ed; color: #ea580c; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 10px 20px; border-radius: 50px; border: 1px solid #fed7aa;">
                Status: Pending Approval
              </span>
            </div>
          </div>

          <div style="background-color: #f8fafc; padding: 30px 20px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: 700;">© ${new Date().getFullYear()} Arshe-Mart. All Rights Reserved.</p>
            <p style="margin: 8px 0 0; color: #94a3b8; font-size: 11px; font-weight: 600;">Powered by <a href="https://aura-threads.arshetechnology.com" style="color: #f97316; text-decoration: none; font-weight: 900;">ARSHE TECHNOLOGY</a></p>
          </div>

        </div>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Arshe-Mart 🛍️" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Admin Access Request - Arshe-Mart",
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