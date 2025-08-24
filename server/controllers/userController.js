import pool from "../db.js";

export const getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM USERS WHERE email = $1`, [
      email,
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

export const createUser = async (req, res) => {
  const { name, email, image } = req.body;
  try {
    await pool.query(
      `INSERT INTO USERS (name, email, image) VALUES ($1, $2, $3)`,
      [name, email, image]
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "User creation failed", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { email } = req.params;
  const {
    about,
    skills,
    interests,
    headline,
    location,
    firstName,
    lastName,
    education,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE USERS 
       SET about = $1, skills = $2, interests = $3, 
           bio = $4, location = $5, 
           firstname = $6, lastname = $7, education = $8, updated_at = NOW()
       WHERE email = $9
       RETURNING *`,
      [
        about,
        skills,
        interests,
        headline,
        location,
        firstName,
        lastName,
        education,
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
