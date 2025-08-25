import express from "express";
import {
  createEvent,
  getEvents,
  registerEvent,
  getRegisteredEvents,
  unregisterEvent,
  updateEvent,
  deleteEvent,
  getUserCreatedEvents,
} from "../controllers/eventController.js";

const router = express.Router();

router.post("/", createEvent);
router.post("/register", registerEvent);
router.get("/registered/:user_id", getRegisteredEvents);
router.get("/get-events", getEvents);
router.get("/user-created/:user_id", getUserCreatedEvents);
router.delete("/unregister/:user_id", unregisterEvent);
router.put("/update/:eventId", updateEvent);
router.delete("/delete/:eventId", deleteEvent);

export default router;
