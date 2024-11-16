import express from "express";
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from "../models/user.model.js";
import generateCookieAndSetToken from "../utils/generateToken.js";
import { deleteOtp, getOtp, isOtpExpired, storeOtp } from "../utils/otpStore.js";

const router = express.Router();  
const otpMap = new Map(); // Store OTPs temporarily

let otpStore = {}; 

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
});



const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000); 
};

const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}.`,
  };

  return transporter.sendMail(mailOptions);
};


router.post("/send-otp/:email", async (req, res) => {
  const { email } = req.params;


  if (!email || !email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  const existingOtp = getOtp(email); 
  if (existingOtp) {
    deleteOtp(email);
    console.log(`Old OTP deleted for ${email}`);
  }


  const otp = generateOtp();

  try {
    await sendOtpEmail(email, otp);
    storeOtp(email, otp);

    res.status(200).json({ message: "OTP sent successfully to your email!" });
  } catch (error) {

    console.error("Error sending OTP email:", error);
    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
});

router.post("/verify-otp/:email", (req, res) => {
  const { email } = req.params;
  const { otp: userOtp } = req.body;

  if (!userOtp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  const otpData = getOtp(email);

  if (!otpData) {
    return res.status(404).json({ message: "No OTP found for this email" });
  }

  if (isOtpExpired(email)) {
    deleteOtp(email); 
    return res.status(400).json({ message: "OTP has expired" });
  }

  if (parseInt(userOtp) !== otpData.otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  deleteOtp(email);

  res.status(200).json({ message: "OTP verified successfully!" });
});



router.post("/create-user", async (req, res) => {
  // Extract fields from request body
  const { username, email, gender, address, favourites = [] } = req.body;

  // Validate input fields
  if (
    !username ||
    !email ||
    !gender ||
    !address ||
    !address.name ||
    !address.addressLine1 ||
    !address.city ||
    !address.state ||
    !address.country ||
    !address.zipcode
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields or invalid address format" });
  }

  // Format the address to match the MongoDB schema (addressLine1, addressLine2)
  const formattedAddress = {
    name: address.name,
    addressLine1: address.addressLine1, // Mapping to MongoDB schema
    addressLine2: address.addressLine2, // Mapping to MongoDB schema
    city: address.city,
    state: address.state,
    country: address.country,
    zipcode: address.zipcode,
  };

  try {
    // Create a new user document
    const newUser = new User({
      username,
      email,
      gender,
      Addresses: [formattedAddress], // Send the address as an array
      favourites,
    });

    // Save the user to the database
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error saving user:", error);
    res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
});


export default router;
