import express from "express";
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  checkUsernameAvailability,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:email", getUserByEmail);
router.get("/id/:userId", getUserById);
router.get("/check-username/:username", checkUsernameAvailability);
router.post("/", createUser);
router.put("/:email", updateUser);

export default router;
