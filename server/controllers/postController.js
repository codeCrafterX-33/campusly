import pool from "../db.js";

export const createPost = async (req, res) => {
  const { content, media, visibleIn, email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO POSTS (content, media, createdon, createdby, club)
       VALUES ($1, $2, DEFAULT, $3, $4) RETURNING *`,
      [content, { media: media }, email, visibleIn]
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
};

export const getPosts = async (req, res) => {
  const { club, userEmail, orderField = "createdon" } = req.query;

  if (userEmail) {
    const result = await pool.query(
      `SELECT * FROM posts 
      INNER JOIN users ON posts.createdby = users.email
      WHERE createdby = $1
      ORDER BY ${orderField} DESC`,
      [userEmail]
    );
    return res.status(200).json({
      message: "Posts fetched successfully",
      data: result.rows,
    });
  }

  if (club) {
    try {
      const result = await pool.query(
        `SELECT * FROM posts
   INNER JOIN users ON posts.createdby = users.email
   WHERE club in (${club})
   ORDER BY ${orderField} DESC`
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
  }
};
