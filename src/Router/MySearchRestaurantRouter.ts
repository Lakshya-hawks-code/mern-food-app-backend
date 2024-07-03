import express from "express";
const router = express.Router();
import MySearchRestaurantController from "../Controller/MySearchRestaurantController";

router.post("/search/:city",MySearchRestaurantController.SearchRestauranByCity);

export default router