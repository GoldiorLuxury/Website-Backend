import express from "express";
import { addReview, getReviewsByProductId } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/add", addReview);
router.get("/", getReviewsByProductId);

export default router;
