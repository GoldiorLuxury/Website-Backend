import express from "express"
import {addProduct, getMostOrderedProducts, getProducts }from "../controllers/product.controller.js";

const router = express.Router();

router.post("/add", addProduct)
router.get("/", getProducts)
router.get("/mostOrdered", getMostOrderedProducts)
export default router;