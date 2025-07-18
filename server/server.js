import express from "express";
import { Client } from "pg";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/event", eventRoutes);
app.use("/post", postRoutes);
app.use("/club", clubRoutes);
app.use("/user", userRoutes);
app.use("/otp", otpRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
