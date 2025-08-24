import pool from "../db.js";

// Get all education entries for a user
const getEducationByUser = async (req, res) => {
  try {
    const { userEmail } = req.params;

    // First get the user ID from the users table
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [userEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // Get all education entries for this user
    const educationQuery = `
      SELECT * FROM education 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const educationResult = await pool.query(educationQuery, [userId]);

    res.json({
      success: true,
      data: educationResult.rows,
    });
  } catch (error) {
    console.error("Error fetching education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new education entry
const createEducation = async (req, res) => {
  try {
    const {
      userEmail,
      school,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      activities,
      societies,
    } = req.body;

    // First get the user ID from the users table
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [userEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // Insert new education entry
    const insertQuery = `
      INSERT INTO education (user_id, school, degree, field_of_study, start_date, end_date, grade, activities, societies)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      userId,
      JSON.stringify(school),
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      activities,
      societies,
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an education entry
const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      school,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      activities,
      societies,
    } = req.body;

    const updateQuery = `
      UPDATE education 
      SET school = $1, degree = $2, field_of_study = $3, start_date = $4, end_date = $5, 
          grade = $6, activities = $7, societies = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      JSON.stringify(school),
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      activities,
      societies,
      id,
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Education entry not found" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an education entry
const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = "DELETE FROM education WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Education entry not found" });
    }

    console.log("Education entry deleted successfully");

    res.json({
      success: true,
      message: "Education entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update all education entries for a user (for bulk operations)
const updateUserEducation = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { education } = req.body;

    // First get the user ID from the users table
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [userEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    // Delete all existing education entries for this user
    const deleteQuery = "DELETE FROM education WHERE user_id = $1";
    await pool.query(deleteQuery, [userId]);

    // Insert all new education entries
    if (education && education.length > 0) {
      const insertQuery = `
        INSERT INTO education (user_id, school, degree, field_of_study, start_date, end_date, grade, activities, societies)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      for (const entry of education) {
        const values = [
          userId,
          JSON.stringify(entry.school),
          entry.degree,
          entry.fieldOfStudy,
          entry.startDate,
          entry.endDate,
          entry.grade,
          entry.activities,
          entry.societies,
        ];
        await pool.query(insertQuery, values);
      }
    }

    res.json({
      success: true,
      message: "Education entries updated successfully",
    });
  } catch (error) {
    console.error("Error updating user education:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  getEducationByUser,
  createEducation,
  updateEducation,
  deleteEducation,
  updateUserEducation,
};
