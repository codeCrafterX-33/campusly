import express from "express";
import {
  toggleLike,
  getLikeCount,
  checkLikeStatus,
  getPostLikes,
  getUserLikedPosts,
} from "../controllers/likeController.js";

const router = express.Router();

// Toggle like (like/unlike a post)
router.post("/:postId/toggle", toggleLike);

// Get like count for a post
router.get("/:postId/count", getLikeCount);

// Check if user has liked a post
router.get("/:postId/status", checkLikeStatus);

// Get all likes for a post with user details
router.get("/:postId/likes", getPostLikes);

// Get user's liked posts
router.get("/user/:userId/liked-posts", getUserLikedPosts);

export default router;
