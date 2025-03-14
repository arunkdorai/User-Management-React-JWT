import User from "../Models/Usermodel.js";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token found. Please login.' });
  }

  try {

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    

    req.user = decoded; 
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: 'Invalid or expired token. Please login again.' });
  }
};


export const Adminverify =async(req, res, next) => {
  
  const token = req.cookies.admintoken;


  if (!token) {
    return res.status(401).json({ message: 'No token found. Please login.' });
  }

  try {

    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    
   const admin=await User.findById(decoded.id)
    if(!admin.admin){
      return res.status(403).json({ message: 'You are not an admin', success: false });
      
    }
    
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: 'Invalid or expired token. Please login again.' });
  }
};
