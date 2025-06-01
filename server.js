import express from "express";
import { Client } from "pg";
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
  port: parseInt(process.env.EXPO_PUBLIC_DB_PORT || "5432"),
  database: process.env.EXPO_PUBLIC_DB_DATABASE,
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/user/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const result = await client.query(`SELECT * FROM USERS WHERE email = $1`, [
      email,
    ]);
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
    await client.query(
      `INSERT INTO USERS (name, email, image) VALUES ($1, $2, $3)`,
      [name, email, image]
    );

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "User creation failed",
      error: error.message,
    });
  }
});

app.post("/post", async (req, res) => {
  const { content, imageUrl, visibleIn, email } = req.body;
  console.log(content, imageUrl, visibleIn, email);

  try {
    const result = await client.query(
      `INSERT INTO POSTS (content, imageurl, visiblein, createdon, createdby)
       VALUES ($1, $2, $3, DEFAULT, $4) RETURNING *`,
      [content, imageUrl, visibleIn, email]
    );

    res.status(201).json({
      message: "Post created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Post creation failed",
      error: error.message,
    });
  }
});

app.get("/posts", async (req, res) => {
  const { visibleIn, orderField = "createdon" } = req.query;

  try {
    const result = await client.query(
      `SELECT * FROM posts
       INNER JOIN users ON posts.createdby = users.email
       WHERE visiblein = $1
       ORDER BY ${orderField} DESC`,
      [visibleIn]
    );

    res.status(200).json({
      message: "Posts fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Posts fetching failed",
      error: error.message,
    });
  }
});

app.get("/clubs", async (req, res) => {
  try {
    const result = await client.query(`SELECT * FROM clubs ORDER BY name ASC`);

    res.status(200).json({
      message: "Clubs fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Clubs fetching failed",
      error: error.message,
    });
  }
});

client
  .connect()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
