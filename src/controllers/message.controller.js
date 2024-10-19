import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Conversation} from "../models/conversation.models.js"
import {Message} from "../models/message.models.js"
import { getRecieverSocketId, io } from "../socket/socket.js";

export const sendMessage = asyncHandler(async (req,res) => {
    const {id: recieverId} = req.params;

    const {message} = req.body;

    const senderId = req.user._id

    if(!message) throw new ApiError(400 , "message is required");

    let conversation = await Conversation.findOne({partcipants : {$all : [senderId , recieverId]}})

    if(!conversation){
        conversation =  await Conversation.create({
        partcipants : [senderId , recieverId]
    })}

    const newMessage = new Message({
        senderId ,
        recieverId ,
        message
    })

    conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save() , newMessage.save()]);

    const receiverSocketId =  getRecieverSocketId(recieverId);

    if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage" , newMessage)
    }

    return res.status(200).json(new ApiResponse(200 , newMessage , "message send successfully"))

})

export const getMessage = asyncHandler(async (req , res) => {
    const {id : userToId} = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
        partcipants : {$all : [senderId , userToId]}
    }).populate("messages");

    //await Conversation.aggregate([])

    if(!conversation) return res.status(200).json([]);

    return res.status(200).json (new ApiResponse(200 , conversation.messages , "messages fetched successfully"));
})