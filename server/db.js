
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_DATABASE,
});

client
  .connect()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Database connection failed:", err));

export default client;
