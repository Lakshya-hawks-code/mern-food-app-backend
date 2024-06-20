import express,{Request,Response} from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import MyUserRouter from "./Router/MyUserRouer";
import MyRestaurantRouter from "./Router/MyRestaurantRouter";
import {v2 as cloudinary} from "cloudinary";

const app = express();

app.use(express.json());
app.use(cors());

cloudinary.config
({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLODINARY_API_KEY ,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

app.get("/health",(req:Request,res:Response) =>
{
    res.send({message:"Health Successfull!"})
})

app.use("/api/v1/user",MyUserRouter);
app.use("/api/v1/restaurant",MyRestaurantRouter);

mongoose.connect(process.env.MONGODB_CONNECTION_URL as string)
.then(()=>
{
    console.log("Database Connection Successfully Connected");
}).catch((error)=>
{
    console.log(error);
})

const port = process.env.PORT;

app.listen(port,()=>
{
    console.log(`listing the port on ${port}`);    
})