import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import { Responses } from "../utils/response.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//normal signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role || !phone)
      return res.status(400).json({ message: "All fields required" });

    if(role.toLowerCase() === "admin"){
      return Responses.failResponse(res,"User with admin role can not be created",403);
    }

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(409).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      authProvider: "local",
      role: role,
      phone: phone
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//normal login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password");

    if (!user || user.authProvider !== "local")
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id,user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//google signup/login
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        authProvider: "google",
        isEmailVerified: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Google authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Google authentication failed" });
  }
};

//logout user
export const logoutUser = async (req, res) => {
  try {
    // Clear session/token on client side
    // Token validation is handled on client via removal
    res.json({
      message: "Logout successful",
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get current user
export const getCurrentUser = async (req, res) => {
  try {
    // User info comes from authMiddleware which populates req.user
    const user = req.user;
    
    res.json({
      message: "User profile retrieved",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

