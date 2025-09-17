import pool from "../db.js";

export const createClub = async (req, res) => {
  const { name, description, imageUrl, user_email, user_id } = req.body;

  console.log(name, description, imageUrl);

  try {
    const result = await pool.query(
      `INSERT INTO clubs VALUES (DEFAULT, $1, $2, $3, DEFAULT, $4, $5) RETURNING *`,
      [name, imageUrl, description, user_email, user_id]
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
    const result = await pool.query(
      `SELECT 
         clubs.id,
         clubs.name,
         clubs.about,
         clubs.club_logo,
         clubs.createdon,
         clubs.user_id,
         clubs.rules,
         users.username
       FROM clubs
       INNER JOIN users ON clubs.user_id = users.id
       ORDER BY clubs.name ASC`
    );

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
      `SELECT 
         clubs.id,
         clubs.name,
         clubs.about,
         clubs.club_logo,
         clubs.createdon,
         clubs.user_id,
         clubs.rules,
         users.username AS username,
         clubfollowers.club_id,
         clubfollowers.user_id AS follower_user_id
       FROM clubs
       INNER JOIN clubfollowers ON clubs.id = clubfollowers.club_id
       INNER JOIN users ON clubs.user_id = users.id
       WHERE clubfollowers.user_id = $1;`,
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
      `SELECT 
         clubs.id,
         clubs.name,
         clubs.about,
         clubs.club_logo,
         clubs.createdon,
         clubs.user_id,
         clubs.rules,
         users.username AS username
       FROM clubs 
       INNER JOIN users ON clubs.user_id = users.id
       WHERE clubs.user_id = $1 
       ORDER BY clubs.name ASC`,
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
  const { club_id } = req.params;
  const { name, description, imageUrl } = req.body;
  const { user_id } = req.body;

  try {
    // First check if the user is the creator of the club
    const checkResult = await pool.query(
      `SELECT user_id FROM clubs WHERE id = $1 AND user_id = $2`,
      [club_id, user_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({
        message: "You can only edit clubs you created",
      });
    }

    const result = await pool.query(
      `UPDATE clubs SET name = $1, about = $2, club_logo = $3 WHERE id = $4 RETURNING *`,
      [name, description, imageUrl, club_id]
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
  const { club_id } = req.params;
  const { user_id } = req.body;

  try {
    // First check if the user is the creator of the club
    const checkResult = await pool.query(
      `SELECT user_id FROM clubs WHERE id = $1 AND user_id = $2`,
      [club_id, user_id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (checkResult.rows[0].user_id !== user_id) {
      return res.status(403).json({
        message: "You can only delete clubs you created",
      });
    }

    // Delete club followers first (due to foreign key constraints)
    await pool.query(`DELETE FROM clubfollowers WHERE club_id = $1`, [club_id]);

    // Delete the club
    await pool.query(`DELETE FROM clubs WHERE id = $1`, [club_id]);

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

// Get club members
export const getClubMembers = async (req, res) => {
  const { club_id } = req.params;

  try {
    // First get the club creator as admin
    const creatorResult = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.firstname,
        u.lastname,
        u.image,
        c.createdon AS joined_date,
        true as is_admin
      FROM clubs c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = $1`,
      [club_id]
    );

    // Then get all other members (followers)
    const membersResult = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.firstname,
        u.lastname,
        u.image,
        cf.followed_on AS joined_date,
        CASE 
          WHEN ca.user_id IS NOT NULL THEN true  -- Listed in club_admins
          ELSE false 
        END as is_admin
      FROM clubfollowers cf
      INNER JOIN users u ON cf.user_id = u.id
      LEFT JOIN club_admins ca ON cf.club_id = ca.club_id AND cf.user_id = ca.user_id
      WHERE cf.club_id = $1
      ORDER BY cf.followed_on DESC`,
      [club_id]
    );

    // Combine creator and members, ensuring creator is first
    const allMembers = [...creatorResult.rows, ...membersResult.rows];

    res.status(200).json({
      message: "Club members fetched successfully",
      data: allMembers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Club members fetching failed",
      error: error.message,
    });
  }
};

// Remove member from club
export const removeClubMember = async (req, res) => {
  const { club_id } = req.params;
  const { user_id, member_id } = req.body;

  try {
    // Check if the requesting user is the club owner
    const clubCheck = await pool.query(
      "SELECT user_id FROM clubs WHERE id = $1",
      [club_id]
    );

    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (clubCheck.rows[0].user_id !== parseInt(user_id)) {
      return res.status(403).json({
        message: "Only club owners can remove members",
      });
    }

    // Check if trying to remove the club owner
    if (parseInt(member_id) === clubCheck.rows[0].user_id) {
      return res.status(400).json({
        message: "Cannot remove club owner",
      });
    }

    // Remove the member
    const result = await pool.query(
      "DELETE FROM clubfollowers WHERE club_id = $1 AND user_id = $2",
      [club_id, member_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Member not found in this club",
      });
    }

    res.status(200).json({
      message: "Member removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Member removal failed",
      error: error.message,
    });
  }
};

// Get club rules
export const getClubRules = async (req, res) => {
  const { club_id } = req.params;

  try {
    const result = await pool.query("SELECT rules FROM clubs WHERE id = $1", [
      club_id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    res.status(200).json({
      message: "Club rules fetched successfully",
      data: { rules: result.rows[0].rules || "" },
    });
  } catch (error) {
    res.status(500).json({
      message: "Club rules fetching failed",
      error: error.message,
    });
  }
};

// Update club rules
export const updateClubRules = async (req, res) => {
  const { club_id } = req.params;
  const { user_id, rules } = req.body;

  try {
    // Check if the requesting user is the club owner
    const clubCheck = await pool.query(
      "SELECT user_id FROM clubs WHERE id = $1",
      [club_id]
    );

    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (clubCheck.rows[0].user_id !== parseInt(user_id)) {
      return res.status(403).json({
        message: "Only club owners can update rules",
      });
    }

    // Update the rules
    const result = await pool.query(
      "UPDATE clubs SET rules = $1 WHERE id = $2",
      [rules, club_id]
    );

    res.status(200).json({
      message: "Club rules updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Club rules update failed",
      error: error.message,
    });
  }
};

// Add admin to club
export const addClubAdmin = async (req, res) => {
  const { club_id } = req.params;
  const { user_id, admin_user_id } = req.body;

  try {
    // Check if user is the club owner
    const clubCheck = await pool.query(
      "SELECT user_id FROM clubs WHERE id = $1",
      [club_id]
    );

    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (clubCheck.rows[0].user_id !== parseInt(user_id)) {
      return res.status(403).json({
        message: "Only club owners can add admins",
      });
    }

    // Check if the user to be made admin is a member of the club
    const memberCheck = await pool.query(
      "SELECT user_id FROM clubfollowers WHERE club_id = $1 AND user_id = $2",
      [club_id, admin_user_id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(400).json({
        message: "User must be a member of the club to become an admin",
      });
    }

    // Add admin
    const result = await pool.query(
      "INSERT INTO club_admins (club_id, user_id, added_by) VALUES ($1, $2, $3) ON CONFLICT (club_id, user_id) DO NOTHING",
      [club_id, admin_user_id, user_id]
    );

    res.status(200).json({
      message: "Admin added successfully",
      data: { admin_user_id },
    });
  } catch (error) {
    console.error("Error adding club admin:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

// Remove admin from club
export const removeClubAdmin = async (req, res) => {
  const { club_id } = req.params;
  const { user_id, admin_user_id } = req.body;

  try {
    // Check if user is the club owner
    const clubCheck = await pool.query(
      "SELECT user_id FROM clubs WHERE id = $1",
      [club_id]
    );

    if (clubCheck.rows.length === 0) {
      return res.status(404).json({
        message: "Club not found",
      });
    }

    if (clubCheck.rows[0].user_id !== parseInt(user_id)) {
      return res.status(403).json({
        message: "Only club owners can remove admins",
      });
    }

    // Prevent removing the club owner
    if (admin_user_id === clubCheck.rows[0].user_id) {
      return res.status(400).json({
        message: "Cannot remove the club owner from admin role",
      });
    }

    // Remove admin
    const result = await pool.query(
      "DELETE FROM club_admins WHERE club_id = $1 AND user_id = $2",
      [club_id, admin_user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }

    res.status(200).json({
      message: "Admin removed successfully",
      data: { admin_user_id },
    });
  } catch (error) {
    console.error("Error removing club admin:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
