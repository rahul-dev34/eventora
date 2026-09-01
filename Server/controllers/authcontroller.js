const  User  = require("../models/user.js");
const  OTP  = require("../models/otp.js"); // apna actual OTP model path check kar
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/email.js");

// Token function sab controllers use kar sakte hain
const generateToken = (id, role , email) => {
  return jwt.sign({ id, role , email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Existing user check
    const userExist = await User.findOne({ email });

    if (userExist && userExist.isVerified) {
      return res.status(409).json({
        message: "User already exists. Please login.",
      });
    }

    // User hai but verify nahi hua → new OTP bhejo
    if (userExist && !userExist.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await OTP.deleteMany({ email, action: "account_verification" });
      await OTP.create({ email, otp, action: "account_verification" });

      await sendOtpEmail(email, otp, "account_verification");

      return res.json({
        message: "OTP sent again. Please verify your account.",
      });
    }

    // New user create
    const hashedPw = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPw,
      role: "user",
      isVerified: false,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.create({ email, otp, action: "account_verification" });
    await sendOtpEmail(email, otp, "account_verification");

    return res.status(201).json({
      message: "Successfully signed up. OTP sent.",
    });
  } catch (error) {
    console.error("Signup error:", error); // terminal mein actual error

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
      });
    }

    if (!user.isVerified && user.role === "user") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await OTP.deleteMany({ email, action: "account_verification" });
      await OTP.create({ email, otp, action: "account_verification" });
      await sendOtpEmail(email, otp, "account_verification");

      return res.status(403).json({
        message: "Account not verified. OTP sent again.",
        needsVerification: true,
      });
    }

    return res.json({
      message: "Login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role , user.email),
    });
  } catch (error) {
    console.error("Signin error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      otp,
      action: "account_verification",
    });

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true } // updated user return karega
    );

    await OTP.deleteMany({ email, action: "account_verification" });

    return res.json({
      message: "Account verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role,user.email),
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};