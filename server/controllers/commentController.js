import pool from "../db.js";

// Create a new comment
export const createComment = async (req, res) => {
  const {
    postId,
    content,
    media,
    user_id,
    createdby,
    parentCommentId,
  } = req.body;

  // Convert postId to integer
  const postIdInt = parseInt(postId);

  // Debug logging
  console.log("Creating comment with data:", {
    postId,
    postIdInt,
    content,
    user_id,
    createdby,
    parentCommentId,
    media,
  });

  try {
    // Validate input - allow either content or media
    const hasContent = content && content.trim().length > 0;
    const hasMedia = media && Array.isArray(media) && media.length > 0;

    if (!postId || !user_id || (!hasContent && !hasMedia)) {
      return res.status(400).json({
        message:
          "Missing required fields: postId, user_id, and either content or media",
      });
    }

    // Calculate comment depth
    let commentDepth = 1; // Default for direct comment
    let parentPostId = postIdInt;

    if (parentCommentId) {
      // This is a reply to a comment, get the parent comment's depth
      const parentComment = await pool.query(
        `SELECT comment_depth, parent_post_id FROM posts WHERE id = $1`,
        [parentCommentId]
      );

      if (parentComment.rows.length === 0) {
        return res.status(404).json({
          message: "Parent comment not found",
        });
      }

      const parentDepth = parentComment.rows[0].comment_depth;
      commentDepth = parentDepth + 1;

      // Ensure we don't exceed 2 levels
      if (commentDepth > 2) {
        return res.status(400).json({
          message: "Maximum comment depth exceeded (2 levels max)",
        });
      }

     
    }

    // Create the comment
    console.log("Inserting comment with values:", {
      content,
      media: { media: media || [] },
      createdby,
      parentPostId,
      commentDepth,
    });

    const result = await pool.query(
      `INSERT INTO posts (content, media, createdby, user_id, parent_post_id, comment_depth, club) 
       VALUES ($1, $2, $3, $4, $5, $6, 0) RETURNING *`,
      [
        content || "", // Ensure content is always a string
        { media: media || [] },
        createdby,
        user_id,
        parentPostId,
        commentDepth,
      ]
    );

    console.log("Comment created successfully:", result.rows[0]);

    // Update parent post comment count
    await pool.query(
      `UPDATE posts SET comment_count = comment_count + 1 WHERE id = $1`,
      [parentPostId]
    );

    res.status(201).json({
      message: "Comment created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({
      message: "Comment creation failed",
      error: error.message,
    });
  }
};

// Get comments for a post with threading
export const getComments = async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20, includeReplies = true } = req.query;
  const offset = (page - 1) * limit;

  // Convert postId to integer
  const postIdInt = parseInt(postId);

  try {
    // First, let's test a simple query to see if the columns exist
    console.log("Testing basic query...");
    const testQuery = `SELECT id, content, comment_depth, parent_post_id FROM posts WHERE parent_post_id = $1 LIMIT 1`;
    console.log("Executing test query with postIdInt:", postIdInt);
    const testResult = await pool.query(testQuery, [postIdInt]);
    console.log("Test query result:", testResult.rows);

    // Test if the posts table has the required columns
    console.log("Testing table structure...");
    const structureQuery = `SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name IN ('parent_post_id', 'comment_depth')`;
    const structureResult = await pool.query(structureQuery);
    console.log("Available columns:", structureResult.rows);

    // Get direct comments (depth = 1) with user info
    const commentsQuery = `
      SELECT 
        p.*,
        u.firstname,
        u.lastname,
        u.username,
        u.image as user_image,
        u.studentstatusverified
      FROM posts p
      JOIN users u ON p.createdby = u.email
      WHERE p.parent_post_id = $1 
        AND p.comment_depth IN (1, 2)
      ORDER BY p.createdon ASC
      LIMIT $2 OFFSET $3
    `;

    console.log("Executing comments query...");
    console.log("Query parameters:", { postIdInt, limit, offset });
    console.log("Full query:", commentsQuery);

    const commentsResult = await pool.query(commentsQuery, [
      postIdInt,
      limit,
      offset,
    ]);
    console.log(
      "Comments query result:",
      commentsResult.rows.length,
      "comments found"
    );

    let comments = commentsResult.rows;

    // If includeReplies is true, get replies for each comment
    if (includeReplies === "true") {
      for (let comment of comments) {
        const repliesQuery = `
          SELECT 
            p.*,
            u.firstname,
            u.lastname,
            u.username,
            u.image as user_image,
            u.studentstatusverified
          FROM posts p
          JOIN users u ON p.createdby = u.email
          WHERE p.parent_post_id = $1 
            AND p.comment_depth = 2
          ORDER BY p.createdon ASC
        `;

        const repliesResult = await pool.query(repliesQuery, [comment.id]);
        comment.replies = repliesResult.rows;
      }
    }

    // Get total count for pagination
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts WHERE parent_post_id = $1 AND comment_depth IN (1, 2)`,
      [postIdInt]
    );

    const totalComments = parseInt(countResult.rows[0].count);

    res.status(200).json({
      comments: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalComments,
        totalPages: Math.ceil(totalComments / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      postId,
      postIdInt,
      page,
      limit,
    });
    console.error("Full error object:", error);
    res.status(500).json({
      message: "Failed to fetch comments",
      error: error.message,
      details: {
        postId,
        postIdInt,
        page,
        limit,
      },
    });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content, user_id } = req.body;

  try {
    // Verify ownership
    const comment = await pool.query(
      `SELECT user_id FROM posts WHERE id = $1`,
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.rows[0].user_id !== user_id) {
      return res.status(403).json({
        message: "Not authorized to update this comment",
      });
    }

    // Update the comment
    const result = await pool.query(
      `UPDATE posts SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [content, commentId]
    );

    res.status(200).json({
      message: "Comment updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      message: "Failed to update comment",
      error: error.message,
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const { user_id } = req.body;

  try {
    // Verify ownership
    const comment = await pool.query(
      `SELECT user_id, parent_post_id, comment_depth FROM posts WHERE id = $1`,
      [commentId]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.rows[0].user_id !== user_id) {
      return res.status(403).json({
        message: "Not authorized to delete this comment",
      });
    }

    const commentData = comment.rows[0];

    // Delete the comment
    await pool.query(`DELETE FROM posts WHERE id = $1`, [commentId]);

    // Update parent post comment count
    if (commentData.parent_post_id) {
      await pool.query(
        `UPDATE posts SET comment_count = comment_count - 1 WHERE id = $1`,
        [commentData.parent_post_id]
      );
    }

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      message: "Failed to delete comment",
      error: error.message,
    });
  }
};

// Like/unlike a comment
export const toggleCommentLike = async (req, res) => {
  const { commentId } = req.params;
  const { user_id } = req.body;

  try {
    // Check if user already liked this comment
    const existingLike = await pool.query(
      `SELECT id FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
      [user_id, commentId]
    );

    if (existingLike.rows.length > 0) {
      // Unlike: Remove the like
      await pool.query(
        `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
        [user_id, commentId]
      );

      // Decrease like count
      await pool.query(
        `UPDATE posts SET like_count = like_count - 1 WHERE id = $1`,
        [commentId]
      );

      res.status(200).json({
        message: "Comment unliked",
        liked: false,
      });
    } else {
      // Like: Add the like
      await pool.query(
        `INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)`,
        [user_id, commentId]
      );

      // Increase like count
      await pool.query(
        `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`,
        [commentId]
      );

      res.status(200).json({
        message: "Comment liked",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res.status(500).json({
      message: "Failed to toggle comment like",
      error: error.message,
    });
  }
};
