import User from '../Models/Usermodel.js'
import { createSecretToken } from '../Util/Secrettocken.js';
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

export const Login = async (req, res) => {
    try {
      const { email, password } = req.body;
    
      console.log(req.body);
      
      const user = await User.findOne({ email });
      if(!user){
        return res.status(401).json({
          message:'Incorrect email or password',
          success:false
        });
      }
      
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        return res.status(401).json({
          message:'Incorrect email or password',
          success:false
        });
      }
      
      if(!user.admin){
        return res.status(403).json({ 
          message: 'You are not an admin',
          success: false
        });
      }
       
      const token = createSecretToken(user._id);
      res.cookie("admintoken", token, {
        withCredentials: true,
        httpOnly: false,
      });
      
      return res.status(201).json({ 
        message: "Admin logged in successfully", 
        success: true 
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "An error occurred during login",
        success: false
      });
    }
  }

  export const Getallusers = async (req, res) => {
    try {
      const allusers = await User.find();
      res.status(200).json({ 
        allusers,
        success: true
      }); 
    } catch (error) {
      console.error('Error fetching users:', error); 
      res.status(500).json({ 
        message: 'Failed to fetch users',
        success: false
      }); 
    }
  };

  export const Edituserdata = async (req, res) => {
    try {
      const userId = req.params.userid
      const { username, email, image } = req.body;
       
      console.log(req.body, userId);
   
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
        edituser: updatedUser
      });
          
    } catch (error) {
      console.error(error);
      
      return res.status(500).json({ 
        message: "An error occurred while updating user",
        success: false
      });
    }
  }
  
  export const deleteUser = async (req, res) => {
    try {
      const userId = req.params.userid;
    
      const deleteduser = await User.findByIdAndDelete(userId);
      if(deleteduser) {
        return res.status(200).json({
          message: "Successfully deleted user", 
          success: true
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while deleting the user', 
        error: error.message 
      });
    }
  }

  export const addUser = async (req, res) => {
    try {
      const { email, password, username, image } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: "User already exists", 
          success: false 
        });
      }
      
      // Create new user
      const user = await User.create({ email, password, username, image });
      
      res.status(201).json({ 
        message: "User created successfully", 
        success: true, 
        user 
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ 
        success: false, 
        message: 'An error occurred while creating the user', 
        error: error.message 
      });
    }
  };

  export const logoutAdmin = async (req, res) => {
    try {
      res.clearCookie("admintoken");
      return res.status(200).json({ 
        message: "Admin logged out successfully", 
        success: true 
      });
    } catch (error) {
      console.error('Error logging out:', error);
      return res.status(500).json({ 
        message: "Error logging out", 
        success: false 
      });
    }
  };