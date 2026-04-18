const nodemailer = require("nodemailer");
require("dotenv").config();

const sendOrderEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
      rejectUnauthorized: false,
    },
    });

    const mailOptions = {
      from: `"TEKLIY" <${process.env.EMAIL_USER}>`, 
      to,     
      subject, 
      html,   
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully: " + info.messageId);
    return info;
    
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendOrderEmail;