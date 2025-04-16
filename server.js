import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Loads .env variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // Parse JSON body

app.post("/api/contact", async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
        return res.status(400).json({ error: "Please fill all fields" });
    }

    const transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Website Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "New Contact Form Submission",
            html: `
        <h3>New Message from Goldior Luxury Contact Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
        });

        res.status(200).json({ message: "Email sent successfully!" });
    } catch (error) {
        console.error("Email send error:", error);
        res.status(500).json({ error: "Failed to send message. Try again later." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
