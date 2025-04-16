// main/controllers/authController.js
const { User } = require("../models/user"); // Adjust the path based on your structure
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Check if any users exist
exports.checkUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ exists: count > 0 });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Sign-In Handler
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }
    console.log("loggggggg", email, password);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400 * 1000, // 1 day in milliseconds
      path: "/",
      sameSite: "None",
    });

    res.status(200).json({
      message: "Sign-in successful.",
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Sign-Up Handler
exports.signUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully.",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};
