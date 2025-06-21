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
      `INSERT INTO POSTS (content, imageurl, createdon, createdby, club)
       VALUES ($1, $2, DEFAULT, $3, $4) RETURNING *`,
      [content, imageUrl, email, visibleIn]
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
  const { club, orderField = "createdon" } = req.query;

  if (!club) {
    return res.status(400).json({
      message: "Missing required parameter: club",
    });
  }

  try {
    const result = await client.query(
      `SELECT * FROM posts
   INNER JOIN users ON posts.createdby = users.email
   WHERE club in (${club})
   ORDER BY ${orderField} DESC`
    );
    console.log(result.rows);

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

app.post("/followclub", async (req, res) => {
  const { clubId, u_email } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO clubfollowers VALUES (DEFAULT, $1, $2)`,
      [clubId, u_email]
    );

    res.status(201).json({
      message: "Club follower created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Club follower creation failed",
      error: error.message,
    });
  }
});

app.get("/followedclubs/:u_email", async (req, res) => {
  const { u_email } = req.params;
  console.log("Fetching club followers for user", u_email);
  try {
    const result = await client.query(
      `select clubs.name, clubs.club_logo, clubfollowers.* from clubs
INNER JOIN clubfollowers ON clubs.id=clubfollowers.club_id WHERE clubfollowers.u_email = $1;`,
      [u_email]
    );

    res.status(200).json({
      message: "Club followers fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Club followers fetching failed",
      error: error.message,
    });
  }
});

app.delete("/unfollowclub/:u_email", async (req, res) => {
  const { u_email } = req.params;
  const { clubId } = req.body;
  console.log("Fetching club followers for user", u_email);
  try {
    const result = await client.query(
      `DELETE FROM clubfollowers WHERE u_email = $1 AND club_id = $2`,
      [u_email, clubId]
    );

    res.status(200).json({
      message: "Club followers deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Club followers fetching failed",
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

app.post("/club", async (req, res) => {
  const { name, description, imageUrl, u_email } = req.body;

  console.log(name, description, imageUrl);

  try {
    const result = await client.query(
      `INSERT INTO clubs VALUES (DEFAULT, $1, $2, $3, DEFAULT, $4) RETURNING *`,
      [name, imageUrl, description, u_email]
    );

    res.status(201).json({
      message: "Club created successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Club creation failed",
      error: error.message,
    });
  }
});

app.post("/event", async (req, res) => {
  const {
    eventName,
    eventImage,
    location,
    link,
    eventDate,
    eventTime,
    u_email,
  } = req.body;

  console.log(
    eventName,
    eventImage,
    location,
    link,
    eventDate,
    eventTime,
    u_email
  );
  try {
    const result = await client.query(
      `INSERT INTO events VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7, DEFAULT) RETURNING *`,
      [eventName, location, link, eventImage, eventDate, eventTime, u_email]
    );

    res.status(201).json({
      message: "Event created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Event creation failed",
      error: error?.response?.data,
    });
  }
});

app.get("/events", async (req, res) => {
  try {
    const result =
      await client.query(`select events.*, users.name as username from events
inner join users
on events.createdby=users.email
order by id desc;`);

    res.status(200).json({
      message: "Events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Events fetching failed", error: error.message });
  }
});

app.post("/event/register", async (req, res) => {
  const { eventId, u_email } = req.body;

  try {
    const result = await client.query(
      `INSERT INTO event_registration VALUES (DEFAULT, $1, $2, DEFAULT)`,
      [eventId, u_email]
    );

    res.status(201).json({
      message: "Event registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Event registration failed",
      error: error.message,
    });
  }
});

app.get("/event/registered/:u_email", async (req, res) => {
  const { u_email } = req.params;

  try {
    const result = await client.query(
      `SELECT events.*, event_registration.* FROM events
INNER JOIN event_registration ON events.id = event_registration.event_id
WHERE event_registration.u_email = $1`,
      [u_email]
    );

    res.status(200).json({
      message: "Registered events fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Registered events fetching failed",
      error: error.message,
    });
  }
});

app.delete("/event/unregister/:u_email", async (req, res) => {
  const { u_email } = req.params;
  const { eventId } = req.body;

  try {
    const result = await client.query(
      `DELETE FROM event_registration WHERE u_email = $1 AND event_id = $2`,
      [u_email, eventId]
    );

    res.status(200).json({
      message: "Event unregistered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Event unregistration failed",
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
