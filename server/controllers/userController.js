import pool from "../db.js";

async function getUserIdFromEmail(email) {
  const userQuery = "SELECT id FROM users WHERE email = $1";
  const userResult = await pool.query(userQuery, [email]);
  return userResult.rows[0].id;
}

export const getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const userId = await getUserIdFromEmail(email);
    const result = await pool.query(`SELECT * FROM USERS WHERE id = $1`, [
      userId,
    ]);
    res
      .status(200)
      .json({ message: "User fetched successfully", data: result.rows });
  } catch (error) {
    res
      .status(500)
      .json({ message: "User fetching failed", error: error.message });
  }
};

export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.params;

  try {
    // Check if username exists (case-insensitive)
    const result = await pool.query(
      `SELECT username FROM USERS WHERE LOWER(username) = LOWER($1)`,
      [username]
    );

    const available = result.rows.length === 0;

    // Generate suggestions if username is taken
    let suggestions = [];
    if (!available) {
      const baseUsername = username;
      const numbers = ["1", "2", "3", "2024", "2025", "2026"];
      const suffixes = ["_", "x", "official", "real"];

      // Generate variations
      for (let i = 0; i < 5; i++) {
        const suggestion = baseUsername + numbers[i % numbers.length];
        const checkResult = await pool.query(
          `SELECT username FROM USERS WHERE LOWER(username) = LOWER($1)`,
          [suggestion]
        );
        if (checkResult.rows.length === 0) {
          suggestions.push(suggestion);
        }
      }

      // Add suffix variations
      for (let i = 0; i < 3 && suggestions.length < 5; i++) {
        const suggestion = baseUsername + suffixes[i];
        const checkResult = await pool.query(
          `SELECT username FROM USERS WHERE LOWER(username) = LOWER($1)`,
          [suggestion]
        );
        if (checkResult.rows.length === 0) {
          suggestions.push(suggestion);
        }
      }
    }

    res.status(200).json({
      available,
      suggestions: suggestions.slice(0, 3), // Return max 3 suggestions
    });
  } catch (error) {
    console.error("Username check error:", error);
    res.status(500).json({
      message: "Username check failed",
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  const { name, email, username, image } = req.body;
  console.log("Creating user with data:", { name, email, username, image });

  try {
    console.log("Storing username as:", username);

    // Check if username already exists before inserting
    const existingUser = await pool.query(
      `SELECT username FROM USERS WHERE LOWER(username) = LOWER($1)`,
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log("Username already exists:", existingUser.rows[0]);
      return res.status(400).json({
        message: "Username already exists",
        error: "Username is already taken",
      });
    }

    // Split the name into firstname and lastname
    const nameParts = name.trim().split(" ");
    const firstname = nameParts[0] || "";
    const lastname = nameParts.slice(1).join(" ") || "";

    const result = await pool.query(
      `INSERT INTO USERS (firstname, lastname, email, username, image) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [firstname, lastname, email, username, image]
    );

    console.log("User created successfully:", result.rows[0]);
    res
      .status(201)
      .json({ message: "User created successfully", user: result.rows[0] });
  } catch (error) {
    console.error("User creation error:", error);
    console.error("Error code:", error.code);
    console.error("Error detail:", error.detail);
    console.error("Request body:", req.body);

    // Handle unique constraint violation specifically
    if (error.code === "23505" && error.constraint === "unique_username") {
      return res.status(400).json({
        message: "Username already exists",
        error: "This username is already taken by another user",
      });
    }

    res
      .status(500)
      .json({ message: "User creation failed", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM USERS WHERE id = $1`, [
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User fetched successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "User fetching failed",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { email } = req.params;
  const {
    about,
    skills,
    interests,
    headline,
    country,
    city,
    firstName,
    lastName,
    school,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE USERS 
       SET about = $1, skills = $2, interests = $3, 
           headline = $4, country = $5, city = $6,
           firstname = $7, lastname = $8, school = $9, updated_at = NOW()
       WHERE email = $10
       RETURNING *`,
      [
        about,
        skills,
        interests,
        headline,
        country,
        city,
        firstName,
        lastName,
        school,
        email,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Database update error:", error);
    console.error("Request body:", req.body);
    console.error("User email:", email);
    res.status(500).json({
      message: "User update failed",
      error: error.message,
    });
  }
};
