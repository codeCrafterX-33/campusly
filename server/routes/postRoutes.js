import express from "express";
import {
  createPost,
  getPosts,
  getComments,
  getPostById,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", createPost);
router.get("/posts", getPosts);
router.get("/comments", getComments);
router.get("/post", getPostById);
router.delete("/:postId", deletePost);

export default router;
