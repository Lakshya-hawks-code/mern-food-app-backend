import express from "express";
import MyRestaurantController from "../Controller/MyRestaurantController";
import { jwtCheck, verifyToken } from "../Middleware/middleware";
import upload from "../config/multer";

const router = express.Router();
   

router.post("/create-restaurant",jwtCheck,verifyToken,upload.single("imageFile"),MyRestaurantController.createRestaurant);
router.post("/find-restaurant",jwtCheck,verifyToken,MyRestaurantController.getMyRestaurant);
router.post("/update-restaurant",jwtCheck,verifyToken,upload.single("imageFile"),MyRestaurantController.updateRestaurant);

export default router;