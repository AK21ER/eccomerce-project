import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {  createCheckoutSession, verifyCheckoutCode } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/verification", protectRoute, verifyCheckoutCode);

export default router;