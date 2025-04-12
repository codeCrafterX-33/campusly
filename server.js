import express from "express";
import { Client } from "node-postgres";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const client = new Client({
  user: process.env.EXPO_PUBLIC_DB_USERNAME,
  password: process.env.EXPO_PUBLIC_DB_PASSWORD,
  host: process.env.EXPO_PUBLIC_DB_HOST,

  port: process.env.EXPO_PUBLIC_DB_PORT,
  database: process.env.EXPO_PUBLIC_DB_DATABASE,
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const result = await client.query(
      `SELECT * FROM USERS WHERE email = '${email}'`
    );
    res.status(200).json({
      message: "Users fetched successfully",
      data: result.rows, 
    });
  } catch (error) {
    res.status(500).json({
      message: "User fetching failed",
      error: error.message,
    });
  }
});

app.post("/user", async (req, res) => {
  const { name, email, image } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO USERS VALUES(DEFAULT, '${name}', '${email}', '${image}')`
    );

    res.status(201).json({
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "User creation failed",
      error: error.message,
    });
  }
});

app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  res.status(200).json({
    message: "User logged in successfully",
    data: { email, password },
  });
});

await client.connect();
console.log("Connected to database");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
