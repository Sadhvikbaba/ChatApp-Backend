import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken 

        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}

    } catch (error) {
        throw new ApiError(500 , "someThing went wrong")
    }
}

const registerUser = asyncHandler( async (req , res) => {

    const {userName , fullName , password , gender} = req.body

    if([userName , fullName , password].some((field) => field?.trim() === "")){
        throw new ApiError(400 , "all fields are required")
    }

    const existeduser = await User.findOne({userName : userName.toLowerCase()})

    if(existeduser) throw new ApiError(409 , "User already exists");

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
	const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;


    const user = await User.create({
        fullName,
        password,
        userName : userName.toLowerCase(),
        gender,
        profilePic : gender == "male" ? boyProfilePic : girlProfilePic 
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -OTP"
    )

    if(!createdUser) throw new ApiError(500 , "something went wrong while registering the user");

    //sendMail(email , "account created successfully");

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User registered successfully")
    );
})

const loginUser = asyncHandler(async (req, res) => {

    const { userName, password } = req.body;

    if (!(userName && password)) throw new ApiError(400, "Email and password are required");

    const userDetails = await User.findOne({ userName });

    if (!userDetails) throw new ApiError(404, "User does not exist");

    const isPasswordValid = await userDetails.isPasswordCorrect(password);

    if (!isPasswordValid) throw new ApiError(401, "Password is incorrect");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(userDetails._id);

    const loggedInUser = await User.findById(userDetails._id).select("-password -refreshToken -OTP");

    const accessTokenOptions = { httpOnly: true, secure: true, sameSite: 'None' };
    const refreshTokenOptions = { httpOnly: true, secure: true, sameSite: 'None' };

    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    res.cookie("accessToken", accessToken, accessTokenOptions);

    return res.status(200).json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully..."));
});

const logoutUser = asyncHandler( async(req , res) => {
    const id = req.user._id
    User.findByIdAndUpdate(id , {$set : { refreshToken : undefined }} , {new : true})

    const options = {httpOnly : true , secure : true}

    return res.status(200).clearCookie("accessToken" , options).clearCookie("refreshToken" , options).
    json(new ApiResponse(200 , {} , "user logged out"))

})

const refreshAccesstoken = asyncHandler( async(req , res) =>{
    const token = req.cookies.refreshToken || req.body.refreshToken
        if(!token) throw new ApiError(401 , "unauthorized user");
    
        const decodedtoken =  jwt.verify(token , process.env.REFRESH_TOKEN_SECRET);
    
        if(!decodedtoken) throw new ApiError(401 , "unauthorized user");
    
        const user = await User.findById(decodedtoken._id);
    
        if(!user) throw new ApiError(401 , "invalid refresh token");
    
        if(user.refreshToken != token) throw new ApiError(401 , "refresh token is expired");
    
        const options = {httpOnly : true , secure : true };
    
        const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res.status(200).cookie("refreshToken" , refreshToken , options).cookie("accessToken" , accessToken , options)
        .json(new ApiResponse(200 , {accessToken , refreshToken} , "access token refreshed"))

})

const getUsers = asyncHandler( async (req , res) => {

    const id = req.user._id

    const users = await User.find({_id : {$ne : id}}).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200 , users , "users fetched successfully"))
})

const getCurrrentUser = asyncHandler(async(req , res) => {
    res.status(200).json(new ApiResponse(200 , req.user , "user details fethed successfully"));
})

export {registerUser , loginUser , logoutUser , refreshAccesstoken , getUsers , getCurrrentUser}
