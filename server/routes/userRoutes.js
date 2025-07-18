import express from "express";
import { getUserByEmail, createUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/:email", getUserByEmail);
router.post("/", createUser);

export default router;
