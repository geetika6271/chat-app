import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSideBar = async (req,res)=>{
    try{
        const loggedUserId = req.user._id;
        const filterdUsers = await User.find({_id: {$ne:loggedUserId}}).select("-password");
        res.status(200).json(filterdUsers);
    } catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
};

export const getMessages = async(req,res)=>{
    try{

        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })

        res.status(200).json(messages);

    } catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
};

export const sendMessage = async(req,res)=>{
    try{
        const {text,image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        let imageUrl;
        if(image){
            //upload base64 image to cloudinary
            const uploadedResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadedResponse.secure_url;  
        }
        const newMessage  = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();

        // todo: realtime functionality
        const recieverSocketId = getReceiverSocketId(receiverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage);
        }

        res.status(201).json(newMessage);

    } catch(err){
        console.log(err);
        res.status(500).json({error:"Internal Server Error"});
    }
}
