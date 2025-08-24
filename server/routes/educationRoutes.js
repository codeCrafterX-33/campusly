import express from "express";
import { Router } from "express";
import {
  getEducationByUser,
  createEducation,
  updateEducation,
  deleteEducation,
  updateUserEducation,
} from "../controllers/educationController.js";

const router = Router();

// Get all education entries for a user
router.get("/:userEmail", getEducationByUser);

// Create a new education entry
router.post("/", createEducation);

// Update an education entry
router.put("/:id", updateEducation);

// Delete an education entry
router.delete("/delete/:id", deleteEducation);

// Update all education entries for a user (for bulk operations)
router.put("/user/:userEmail", updateUserEducation);

export default router;
