import express from "express";
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from "../models/user.model.js";
import generateCookieAndSetToken from "../utils/generateToken.js";

const router = express.Router();
const otpMap = new Map(); // Store OTPs temporarily

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password
    },
});

// Function to send OTP
const sendOtpEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    };

    return transporter.sendMail(mailOptions);
};

router.post('/signup', async (req, res) => {
    try {
        const { username, email, gender, addresses } = req.body;

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Username already exists" });

        // Generate a random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpMap.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); // 10 minutes expiry

        // Send OTP to the user's email
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, username, gender, addresses } = req.body;
        const storedData = otpMap.get(email);
        console.log("Stored Data:", storedData);


        if (!storedData) return res.status(400).json({ error: "OTP not found or expired" });

        if (storedData.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

        // Create new user after OTP verification
        const newUser = new User({
            username,
            gender,
            email,
            Addresses: addresses || [],
        });

        await newUser.save();
        generateCookieAndSetToken(newUser._id, res);

        // Clear OTP from the map after successful signup
        otpMap.delete(email);

        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username
        });
    } catch (error) {
        console.log("Error in verify-otp controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
