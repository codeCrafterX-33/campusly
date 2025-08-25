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
  const { user_id } = req.params;
  console.log("Fetching club followers for user", user_id);
  try {
    const result = await pool.query(
      `select clubs.name, clubs.about, clubs.club_logo, clubfollowers.* from clubs
INNER JOIN clubfollowers ON clubs.id=clubfollowers.club_id WHERE clubfollowers.user_id = $1;`,
      [user_id]
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

export const getUserCreatedClubs = async (req, res) => {
  const { user_id } = req.params;
  console.log("Fetching clubs created by user", user_id);
  try {
    const result = await pool.query(
      `SELECT * FROM clubs WHERE user_id = $1 ORDER BY name ASC`,
      [user_id]
    );

    res.status(200).json({
      message: "User created clubs fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "User created clubs fetching failed",
      error: error.message,
    });
  }
};

export const updateClub = async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl } = req.body;
  const { user_email } = req.body;

  try {
    // First check if the user is the creator of the club
    const checkResult = await pool.query(
      `SELECT createdby FROM clubs WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (checkResult.rows[0].createdby !== user_email) {
      return res.status(403).json({
        message: "You can only edit clubs you created",
      });
    }

    const result = await pool.query(
      `UPDATE clubs SET name = $1, about = $2, club_logo = $3 WHERE id = $4 RETURNING *`,
      [name, description, imageUrl, id]
    );

    res.status(200).json({
      message: "Club updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Club update failed",
      error: error.message,
    });
  }
};

export const deleteClub = async (req, res) => {
  const { id } = req.params;
  const { user_email } = req.body;

  try {
    // First check if the user is the creator of the club
    const checkResult = await pool.query(
      `SELECT createdby FROM clubs WHERE id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (checkResult.rows[0].createdby !== user_email) {
      return res.status(403).json({
        message: "You can only delete clubs you created",
      });
    }

    // Delete club followers first (due to foreign key constraints)
    await pool.query(`DELETE FROM clubfollowers WHERE club_id = $1`, [id]);

    // Delete the club
    await pool.query(`DELETE FROM clubs WHERE id = $1`, [id]);

    res.status(200).json({
      message: "Club deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Club deletion failed",
      error: error.message,
    });
  }
};

export const followClub = async (req, res) => {
  const { user_id } = req.params;
  const { clubId, user_email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO clubfollowers VALUES (DEFAULT, $1, $2, $3)`,
      [clubId, user_email, user_id]
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
  const { user_id } = req.params;
  const { clubId } = req.body;
  console.log("Unfollowing club", clubId, "for user", user_id);
  try {
    const result = await pool.query(
      `DELETE FROM clubfollowers WHERE club_id = $1 AND user_id = $2`,
      [clubId, user_id]
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
