import pool from "../db.js";

export const createPost = async (req, res) => {
  const { content, media, visibleIn, email, user_id } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO POSTS (content, media, createdon, createdby, club, user_id) 
       VALUES ($1, $2, DEFAULT, $3, $4, $5) RETURNING *`,
      [content, { media: media }, email, visibleIn, user_id]
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

export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const { user_id } = req.body;

  try {
    // First check if the post exists and belongs to the user
    const postQuery = await pool.query(
      `SELECT id, user_id FROM posts WHERE id = $1`,
      [postId]
    );

    if (postQuery.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const post = postQuery.rows[0];
    if (post.user_id !== user_id) {
      return res.status(403).json({
        message: "You can only delete your own posts",
      });
    }

    // Delete the post
    await pool.query(`DELETE FROM posts WHERE id = $1`, [postId]);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      message: "Post deletion failed",
      error: error.message,
    });
  }
};

export const getPosts = async (req, res) => {
  const { club, userEmail, orderField = "createdon" } = req.query;

  if (userEmail) {
    const result = await pool.query(
      `SELECT posts.*, users.firstname, users.lastname, users.username, users.email, users.image, users.studentstatusverified,
              COALESCE(posts.comment_count, 0) as comment_count
       FROM posts 
       INNER JOIN users ON posts.createdby = users.email
       WHERE createdby = $1 AND (comment_depth = 0 OR comment_depth IS NULL)
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
        `SELECT posts.*, users.firstname, users.lastname, users.username, users.email, users.image, users.studentstatusverified,
                COALESCE(posts.comment_count, 0) as comment_count
         FROM posts
         INNER JOIN users ON posts.createdby = users.email
         WHERE club in (${club}) AND (comment_depth = 0 OR comment_depth IS NULL)
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
  } else {
    // Default case - get all main posts
    try {
      const result = await pool.query(
        `SELECT posts.*, users.firstname, users.lastname, users.username, users.email, users.image, users.studentstatusverified,
                COALESCE(posts.comment_count, 0) as comment_count
         FROM posts
         INNER JOIN users ON posts.createdby = users.email
         WHERE (comment_depth = 0 OR comment_depth IS NULL)
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
