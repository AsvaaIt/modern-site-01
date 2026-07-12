import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 📨 Route for handling contact form
app.post("/send-mail", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // ⚙️ Configure your email transport
    const transporter = nodemailer.createTransport({
      host: "smtp.secureserver.net", // if you use Zoho mail
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER, // e.g. info@asvaait.in
        pass: process.env.MAIL_PASS, // your app password
      },
    });

    // 📧 Compose the message
    const mailOptions = {
      from: `"ASVAA IT Website" <${process.env.MAIL_USER}>`,
      to: "info@asvaait.in",
      subject: "New Contact Form Submission - ASVAA IT Website",
      html: `
        <h3>New Message from Website Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    // 🚀 Send the mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Mail sent successfully" });
  } catch (error) {
    console.error("Error sending mail:", error);
    res.status(500).json({ error: "Failed to send mail" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
