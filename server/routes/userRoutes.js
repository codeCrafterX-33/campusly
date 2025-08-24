import express from "express";
import {
  getUserByEmail,
  createUser,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:email", getUserByEmail);
router.post("/", createUser);
router.put("/:email", updateUser);

export default router;
