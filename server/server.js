import express from "express";
import dotenv from "dotenv";
import connectDB  from "./db/config.js";
import authRoute from "./auth/route.js";
import controllerRoute from "./controller/route.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import { requireAuth } from "./middleware/auth.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

dotenv.config();
connectDB();


app.get("/", requireAuth, (req, res) => {
  res.status(200).json({ message: "Welcome to the homepage" });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

app.use("/api/v1", authRoute);
app.use("/api/v1", controllerRoute);

process.on("unhandledRejection", err => {
  console.log(`An error occurred: ${err.message}`)
  server.close(() => process.exit(1))
});
