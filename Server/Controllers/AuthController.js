import User from "../Models/Usermodel.js";
import { createSecretToken } from "../Util/Secrettocken.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

export const Signup = async (req, res, next) => {
  try {
    const { email, password, username, image, createdAt } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists", 
        success: false 
      });
    }
    
    const user = await User.create({
      email,
      password,
      username,
      image,
      createdAt,
    });
    
    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    
    res.status(201).json({ 
      message: "User signed in successfully", 
      success: true, 
      user 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "An error occurred during signup", 
      success: false 
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: "Incorrect email or password", 
        success: false 
      });
    }
    
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(401).json({ 
        message: "Incorrect email or password", 
        success: false 
      });
    }
    
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    
    res.status(201).json({ 
      message: "User logged in successfully", 
      success: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "An error occurred during login", 
      success: false 
    });
  }
};

export const Getdata = async (req, res) => {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const userData = await User.findById(decoded.id);

    if (userData) {
      res.status(200).json({ 
        message: "success", 
        success: true,
        userData 
      });
    } else {
      res.status(404).json({
        message: "User not found",
        success: false
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(403).json({ 
      message: "Invalid or expired token. Please login again.", 
      success: false 
    });
  }
};

export const Edituser = async (req, res) => {
  try {
    const token = req.cookies.token;
    const userId = jwt.verify(token, process.env.TOKEN_KEY).id;
    const { username, email, image } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, image },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ 
        message: "User not found",
        success: false
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(403).json({ 
      message: "Invalid or expired token. Please login again.",
      success: false
    });
  }
};