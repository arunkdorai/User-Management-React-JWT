import { Signup,Login,Getdata, Edituser } from "../Controllers/AuthController.js";
import express from "express";
import {verifyToken} from '../Middlewares/Authmiddleware.js'
const router = express.Router();

router.post("/signup", Signup);
router.post('/login',Login)
router.get('/userdata',verifyToken,Getdata)
router.patch('/edituser',verifyToken,Edituser)
// router.post('/',verifyToken)
export default router;
