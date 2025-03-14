import {
  Login,
  Getallusers,
  Edituserdata,
  deleteUser,
  addUser,
  logoutAdmin,
} from "../Controllers/AdmController.js";
import express from "express";
import { Adminverify } from "../Middlewares/Authmiddleware.js";
const Admroute = express.Router();

Admroute.post("/login", Login);
Admroute.get("/getusers", Adminverify, Getallusers);
Admroute.patch("/edituser/:userid", Adminverify, Edituserdata);
Admroute.delete("/deleteuser/:userid", Adminverify, deleteUser);
Admroute.post('/adduser', Adminverify, addUser);
Admroute.get('/logout', logoutAdmin);
export default Admroute;
