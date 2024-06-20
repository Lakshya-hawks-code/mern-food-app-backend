import { Request, Response } from "express";
import restaurantModel from "../Model/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import Validator from "validatorjs";

const createRestaurantValidation = 
{
  restaurantName : "required|string",
  city: "required|string",
  country: "required|string",
  deliveryPrice : "required|number",
  estimatedDeliveryTime : "required|number",
  cuisines:  "required|string",
  "menuItems.*.name": "required|string",
  "menuItems.*.price": "required|number"
}

const createRestaurant = async (req: Request, res: Response) => {
  const request = req.body;
  try {
    const validation = new Validator(request,createRestaurantValidation);
    if(!validation.passes)
      {
          return res.json
          ({
              code:400,
              message:"Invalid Validation",
              errors:validation.errors.all()
          })
      }
    const existingUser = await restaurantModel.findOne({ user: req.userId });
    if (existingUser) {
      return res.json({
        code: 409,
        message: "Restaurant User already exists",
      });
    }

    if (!req.file) {
      return res.json({
        code: 400,
        message: "No image file uploaded",
      });
    }

    const image = req.file as Express.Multer.File;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataUrl = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResource = await cloudinary.v2.uploader.upload(dataUrl);

    const restaurant = new restaurantModel({
      ...request,
      imageUrl: uploadResource.url,
      user: new mongoose.Types.ObjectId(req.userId),
    });

    await restaurant.save();

    return res.json({
      code: 200,
      message: restaurant,
    });
  } catch (error: any) {
    console.error("An error occurred:", error.message);
    return res.json({
      code: 500,
      message: "An error occurred during restaurant creation",
      error: error.message,
    });
  }
};


export const getMyRestaurant = async(req:Request,res:Response) =>
  {
      try {
           const restaurantFind = await restaurantModel.findOne({user:req.userId});
           if(!restaurantFind)
            {
              return res.json
              ({
                code:404,
                message:"Restaurant not found!"
              })
            }
            return res.json
            ({
              code:200,
              restaurant:restaurantFind,
              message:"Restaurant find successfully!"
            })
      } catch (error:any) {
        console.error("An error occurred:", error.message);
        return res.json
        ({
          code: 500,
          message: "An error occurred during restaurant find",
          error: error.message,
        })
      }
  }

  const updateRestaurantValidation = {
    restaurantName : "required|string",
    city: "required|string",
    country: "required|string",
    deliveryPrice : "required|number",
    estimatedDeliveryTime : "required|number",
    cuisines:  "required|string",
    "menuItems.*.name": "required|string",
    "menuItems.*.price": "required|number"
  }


export const updateRestaurant = async(req:Request,res:Response) =>
  {
      const request = req.body;
      try {
         const validation = new Validator(request,updateRestaurantValidation);
         if(!validation.passes)
          {
            return res.json
            ({
              code:400,
              message:"Invalid Validation",
              errors:validation.errors.all()
            })
          } 
          const restaurant = await restaurantModel.findOne({user:req.userId});
          if(!restaurant)
            {
              return res.json
              ({
                code:404,
                message:"Restaurant not found!"
              }) 
            }
            restaurant.restaurantName = request.restaurantName;
            restaurant.city = request.city;
            restaurant.country = request.country;
            restaurant.deliveryPrice = request.deliveryPrice;
            restaurant.estimatedDeliveryTime = request.estimatedDeliveryTime;
            restaurant.cuisines = request.cuisines;
            restaurant.menuItems = request.menuItems;
            if(req.file)
              {
                 const image = req.file as Express.Multer.File;
                 const base64Image = Buffer.from(image.buffer).toString("base64");
                 const dataUrl = `data:${image.mimetype};base64,${base64Image}`;
                 const uploadResource = await cloudinary.v2.uploader.upload(dataUrl);
                 restaurant.imageUrl = uploadResource.url;

              }
              
              await restaurant.save();
              return res.json
              ({
                code:200,
                restaurant:restaurant,
                message:"Restaurant update successfully!"
              })
      } catch (error:any) {
        console.error("An error occurred:", error.message);
        return res.json
        ({
          code: 500,
          message: "An error occurred during restaurant update",
          error: error.message,
        })
      }
  }
 


export default {
  createRestaurant,
  getMyRestaurant,
  updateRestaurant
};