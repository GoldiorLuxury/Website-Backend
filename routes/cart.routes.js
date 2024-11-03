import express from "express";
import { addToCart, getCartByUserId } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add", addToCart);
router.get("/", getCartByUserId);

export default router;
