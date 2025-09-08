import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from "../controllers/commentController.js";

const router = express.Router();

// Comment routes
router.post("/", createComment);
router.get("/:postId", getComments);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);
router.post("/:commentId/like", toggleCommentLike);

export default router;
