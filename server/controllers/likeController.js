import pool from "../db.js";

// Toggle like (like/unlike a post)
export const toggleLike = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    // Check if the like already exists
    const existingLike = await pool.query(
      "SELECT id FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    if (existingLike.rows.length > 0) {
      // Unlike: Remove the like
      await pool.query(
        "DELETE FROM likes WHERE user_id = $1 AND post_id = $2",
        [userId, postId]
      );

      // Decrease like count in posts table
      await pool.query(
        "UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1",
        [postId]
      );

      res.status(200).json({
        message: "Post unliked",
        isLiked: false,
      });
    } else {
      // Like: Add the like
      await pool.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [
        userId,
        postId,
      ]);

      // Increase like count in posts table
      await pool.query(
        "UPDATE posts SET like_count = COALESCE(like_count, 0) + 1 WHERE id = $1",
        [postId]
      );

      res.status(200).json({
        message: "Post liked",
        isLiked: true,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get like count for a post
export const getLikeCount = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM likes WHERE post_id = $1",
      [postId]
    );

    res.status(200).json({
      likeCount: parseInt(result.rows[0].count),
    });
  } catch (error) {
    console.error("Error getting like count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check if user has liked a post
export const checkLikeStatus = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.query;

  try {
    const result = await pool.query(
      "SELECT id FROM likes WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );

    res.status(200).json({
      isLiked: result.rows.length > 0,
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all likes for a post with user details
export const getPostLikes = async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        l.id,
        l.created_at,
        u.id as user_id,
        u.firstname,
        u.lastname,
        u.profilepicture
      FROM likes l
      JOIN users u ON l.user_id = u.id
      WHERE l.post_id = $1
      ORDER BY l.created_at DESC
    `,
      [postId]
    );

    res.status(200).json({
      likes: result.rows,
    });
  } catch (error) {
    console.error("Error getting post likes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user's liked posts
export const getUserLikedPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        p.*,
        l.created_at as liked_at
      FROM likes l
      JOIN posts p ON l.post_id = p.id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `,
      [userId]
    );

    res.status(200).json({
      likedPosts: result.rows,
    });
  } catch (error) {
    console.error("Error getting user liked posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
