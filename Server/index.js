import express from "express";
import connectDB from "./config/Db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./Routes/Authroute.js";
import Admroute from "./Routes/Adminroute.js";
const app = express();
const PORT = 4000;
connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow cookies (like JWT tokens) to be sent
  })
);

app.use(cookieParser());

app.use(express.json());

app.use("/", authRoute);
app.use("/admin", Admroute);
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
