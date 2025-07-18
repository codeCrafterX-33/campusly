import client from "../db.js";

export const getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const result = await client.query(`SELECT * FROM USERS WHERE email = $1`, [
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
    await client.query(
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

