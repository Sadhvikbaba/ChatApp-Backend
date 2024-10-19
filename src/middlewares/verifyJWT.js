import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req , res , next) => {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "");
    
        if (!token) throw new ApiError(401 , "Unauthorized user");
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET );
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        if(!user) throw new ApiError(401 , "invalid access token");
    
        req.user = user ;
        next()
})