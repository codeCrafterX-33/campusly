import express from "express";
import {
  createClub,
  getClubs,
  getUserFollowedClubs,
  followClub,
  unfollowClub,
} from "../controllers/clubController.js";

const router = express.Router();

router.post("/", createClub);
router.get("/", getClubs);
router.get("/followedclubs/:u_email", getUserFollowedClubs);
router.post("/followclub", followClub);
router.delete("/unfollowclub/:u_email", unfollowClub);

export default router;
