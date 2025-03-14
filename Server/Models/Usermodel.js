
import bcrypt from "bcryptjs";
import mongoose from 'mongoose'
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  image: {
    type: String, 
    default: "",  
  },
  admin: {
    type: Boolean,
    default: false, 
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});

const Users= mongoose.model("User", userSchema);
export default Users;
