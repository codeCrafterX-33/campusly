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
  getClubMembers,
  removeClubMember,
  getClubRules,
  updateClubRules,
  addClubAdmin,
  removeClubAdmin,
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
router.get("/members/:club_id", getClubMembers);
router.delete("/remove-member/:club_id", removeClubMember);
router.get("/rules/:club_id", getClubRules);
router.post("/rules/:club_id", updateClubRules);
router.post("/add-admin/:club_id", addClubAdmin);
router.delete("/remove-admin/:club_id", removeClubAdmin);

export default router;
