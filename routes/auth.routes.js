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
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true, // Use SSL/TLS if port is 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // The password from step 3
  }
});


const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Account Verification",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://goldiorimages.s3.ap-south-1.amazonaws.com/goldior-logo.png" alt="Goldior Luxury Logo" style="width: 150px;">
              </div>

              <div style="font-size: 16px; color: #333; line-height: 1.6;">
                  <p>Dear Customer,</p>
                  <p>Thank you for choosing <strong>Goldior Luxury</strong>. To complete your verification, please use the One-Time Password (OTP) below:</p> <br />

                  <div style="font-size: 24px; font-weight: bold; color: #2A7F72; margin: 10px 0; padding: 10px; background-color: #f2f8f3; border: 1px solid #2A7F72; border-radius: 5px; text-align: center;">
                      ${otp}
                  </div>

                  <p>This code is valid for the next 10 minutes. Please do not share it with anyone.</p>

                  <p>Warm regards,</p>
                  <p><strong>Goldior Luxury</strong></p>
              </div>

              <div style="text-align: center; font-size: 14px; color: #888; margin-top: 20px;">
                  <p>If you did not request this, please disregard this message.</p>
                  <p>Visit our website: <a href="https://goldior-frontend.vercel.app" style="color: #2A7F72; text-decoration: none;">https://goldior-frontend.vercel.app</a></p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions)
    .then((info) => {
      console.log(`✅ Email sent successfully to ${email} from ${mailOptions.from}`);
      console.log("SMTP Response:", info.response);
      return info;
    })
    .catch((error) => {
      console.error(`❌ Failed to send email to ${email} from ${mailOptions.from}`);
      console.error("SMTP Error:", error);
      throw error; // rethrow to be caught in your route
    });
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


// Route to get user by email
router.get("/get-user-by-email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });

    if (user) {
      res.json(user); // Return user data
    } else {
      res.status(404).json({ message: "User not found" }); // If user not found
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" }); // Generic error message
  }
});


export default router;