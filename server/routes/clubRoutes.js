import express from "express";
import {
  createClub,
  getClubs,
  getUserFollowedClubs,
  getUserCreatedClubs,
  updateClub,
  deleteClub,
  followClub,
  unfollowClub,
} from "../controllers/clubController.js";

const router = express.Router();

router.post("/", createClub);
router.get("/", getClubs);
router.get("/followedclubs/:user_id", getUserFollowedClubs);
router.get("/userclubs/:user_id", getUserCreatedClubs);
router.put("/updateclub/:club_id", updateClub);
router.delete("/deleteclub/:club_id", deleteClub);
router.post("/followclub/:user_id", followClub);
router.delete("/unfollowclub/:user_id", unfollowClub);

export default router;
