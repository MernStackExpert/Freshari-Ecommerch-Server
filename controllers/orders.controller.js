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
      email: email || "no-email@freshari.com",
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
      <div style="font-family: Arial, sans-serif; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #22C55E;">Freshari 🍃 - Order Confirmed!</h2>
        <p>Hi ${name || "Customer"}, thanks for shopping with us.</p>
        <p><b>Order ID:</b> ${result.insertedId}</p>
        <p><b>Total Amount:</b> ৳${total}</p>
        <p><b>Payment Method:</b> Cash on Delivery</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <h3>Your Items:</h3>
        <ul>
          ${products.map((p) => `<li>${p.name} × ${p.quantity} = ৳${p.price * p.quantity}</li>`).join("")}
        </ul>
        <p style="background: #f0fdf4; padding: 10px; color: #166534;">আমরা দ্রুতই আপনার ঠিকানায় সবজি পৌঁছে দেব!</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Freshari 🍃" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Freshari Order is Placed! 🛒",
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
