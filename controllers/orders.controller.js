const { connectDB, ObjectId } = require("../config/db");
const transporter = require("../config/nodemailer");

const collection = async () => {
  const db = await connectDB();
  return db.collection("orders");
};

const getOrders = async (req, res) => {
  try {
    const ordersCollection = await collection();
    let query = {};
    if (req.query.email) {
      query.email = req.query.email;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalOrder = await ordersCollection.countDocuments(query);
    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({
      totalOrder,
      currentPage: page,
      totalPages: Math.ceil(totalOrder / limit),
      orders,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Failed to fetch orders", error: error.message });
  }
};

const createOrders = async (req, res) => {
  try {
    const ordersCollection = await collection();
    const {
      email,
      name,
      products,
      total,
      shippingAddress,
      phone,
      whatsapp,
      note,
    } = req.body;

    if (!products || products.length === 0 || !total) {
      return res.status(400).send({ message: "Invalid order data" });
    }

    const order = {
      email: email || "no-email@arshemart.com",
      customerName: name,
      phone,
      whatsapp: whatsapp || "N/A",
      note: note || "N/A",
      products,
      total,
      paymentMethod: "COD",
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(order);

    const html = `
      <div style="background-color: #f8fafc; padding: 40px 15px; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(15,23,42,0.05);">
          
          <div style="background-color: #0f172a; padding: 45px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: 2px; color: #ffffff;">
              ARSHE<span style="color: #f97316;">MART.</span>
            </h1>
            <p style="margin: 10px 0 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Premium Grocery Delivery</p>
          </div>

          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 15px; color: #0f172a; font-size: 24px; font-weight: 900;">ধন্যবাদ, ${name || "গ্রাহক"}!</h2>
            <p style="margin: 0 0 30px; color: #64748b; font-size: 15px; font-weight: 500;">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। খুব শীঘ্রই আমাদের একজন প্রতিনিধি আপনার সাথে যোগাযোগ করে অর্ডারটি পৌঁছে দেবেন।</p>

            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 25px; margin-bottom: 35px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding-bottom: 15px;">
                    <strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Order ID</strong><br>
                    <span style="color: #f97316; font-weight: 900; font-size: 16px;">#${result.insertedId}</span>
                  </td>
                  <td style="padding-bottom: 15px; text-align: right;">
                    <strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Payment Method</strong><br>
                    <span style="color: #0f172a; font-weight: 800; font-size: 14px;">Cash on Delivery</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Delivery Address</strong><br>
                    <span style="color: #0f172a; font-size: 14px; font-weight: 600; display: inline-block; margin-top: 4px;">${shippingAddress}</span>
                  </td>
                </tr>
              </table>
            </div>

            <h3 style="margin: 0 0 15px; color: #0f172a; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">অর্ডারকৃত পণ্যসমূহ</h3>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px;">
              ${products.map((p) => `
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 800; font-size: 15px;">
                    ${p.name} 
                    <span style="color: #64748b; font-weight: 600; font-size: 13px; margin-left: 5px;">(x${p.quantity})</span>
                  </td>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 900; font-size: 15px; text-align: right;">৳${p.price * p.quantity}</td>
                </tr>
              `).join("")}
              <tr>
                <td style="padding: 20px 0 0; color: #0f172a; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Total Amount</td>
                <td style="padding: 20px 0 0; color: #f97316; font-weight: 900; font-size: 22px; text-align: right;">৳${total}</td>
              </tr>
            </table>

            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 20px; border-radius: 0 16px 16px 0;">
              <p style="margin: 0; color: #c2410c; font-size: 14px; font-weight: 700;">যেকোনো প্রয়োজনে কল করুন: <a href="tel:+8801724383623" style="color: #ea580c; text-decoration: none; font-weight: 900;">+880 1724383623</a></p>
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
        subject: "Order Confirmed - Arshe-Mart 🛒",
        html,
      });
    } catch (emailError) {
      console.error(emailError.message);
    }

    res.status(201).send({
      message: "Order placed successfully with Cash on Delivery",
      orderId: result.insertedId,
    });
  } catch (error) {
    res.status(500).send({ message: "Failed to create order" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const ordersCollection = await collection();
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).send({ message: "Invalid ID" });

    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...req.body, updatedAt: new Date() } },
    );

    res.send({ message: "Order updated", result });
  } catch (error) {
    res.status(500).send({ message: "Update failed" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const ordersCollection = await collection();
    const id = req.params.id;
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });
    res.send({ message: "Order deleted", result });
  } catch (error) {
    res.status(500).send({ message: "Delete failed" });
  }
};

module.exports = { getOrders, createOrders, updateOrder, deleteOrder };
