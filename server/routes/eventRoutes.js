import express from "express";
import {
  createEvent,
  getEvents,
  registerEvent,
  getRegisteredEvents,
  unregisterEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.post("/", createEvent);
router.post("/register", registerEvent);
router.get("/registered/:u_email", getRegisteredEvents);
router.delete("/unregister/:u_email", unregisterEvent);

export default router;
