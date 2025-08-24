import pool from "../db.js";

export const createClub = async (req, res) => {
  const { name, description, imageUrl, u_email } = req.body;

  console.log(name, description, imageUrl);

  try {
    const result = await pool.query(
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
};

export const getClubs = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM clubs ORDER BY name ASC`);

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
};

export const getUserFollowedClubs = async (req, res) => {
  const { u_email } = req.params;
  console.log("Fetching club followers for user", u_email);
  try {
    const result = await pool.query(
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
};

export const followClub = async (req, res) => {
  const { clubId, u_email } = req.body;

  try {
    const result = await pool.query(
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
};

export const unfollowClub = async (req, res) => {
  const { u_email } = req.params;
  const { clubId } = req.body;
  console.log("Fetching club followers for user", u_email);
  try {
    const result = await pool.query(
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
};
