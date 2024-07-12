import express from "express";
const router = express.Router();
import OrderController from "../Controller/OrderController";
import { jwtCheck, verifyToken} from "../Middleware/middleware";

router.post("/create-checkout-session",jwtCheck,verifyToken,OrderController.createCheckOutSession)

export default router