import mongoose from "mongoose";

export const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB database connected: ${conn.connection.host}`);
    } catch (err){
        console.log(err);
    }
};